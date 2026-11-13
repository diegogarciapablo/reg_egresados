import { GraduateRepository } from "../../../../domain/graduate/graduateRepository.js";
import { Graduate } from "../../../../domain/graduate/Graduate.js";

function toGraduate(row) {
  if (!row) return null;
  let parsedLinks = [];
  if (row.professional_links) {
    parsedLinks = typeof row.professional_links === "string"
      ? JSON.parse(row.professional_links)
      : row.professional_links;
  }
  return new Graduate({
    id: row.id,
    userId: row.user_id,
    registrationCode: row.registration_code,
    firstName: row.first_name,
    lastName: row.last_name,
    currentRole: row.current_role,
    graduationYear: row.graduation_year,
    professionalSummary: row.professional_summary,
    photoUrl: row.photo_url,
    phone: row.phone,
    personalEmail: row.personal_email,
    institutionalEmail: row.institutional_email,
    professionalLinks: Array.isArray(parsedLinks) ? parsedLinks : [],
    githubUrl: row.github_url,
    linkedinUrl: row.linkedin_url,
    portfolioUrl: row.portfolio_url,
    visibility: row.visibility,
    emailVerified: row.email_verified,
    moderationStatus: row.moderation_status,
    moderationObservations: row.moderation_observations,
    moderationUpdatedAt: row.moderation_updated_at,
  });
}

// snake_case <-> camelCase para las columnas que se pueden actualizar
const UPDATABLE_FIELDS = {
  firstName: "first_name",
  lastName: "last_name",
  currentRole: "current_role",
  graduationYear: "graduation_year",
  professionalSummary: "professional_summary",
  photoUrl: "photo_url",
  phone: "phone",
  personalEmail: "personal_email",
  institutionalEmail: "institutional_email",
  professionalLinks: "professional_links",
  githubUrl: "github_url",
  linkedinUrl: "linkedin_url",
  portfolioUrl: "portfolio_url",
  visibility: "visibility",
};

export class PgGraduateRepository extends GraduateRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async _withTransaction(callback) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      `SELECT g.*, u.email_verified FROM graduates g JOIN users u ON u.id = g.user_id
       WHERE g.id = $1 AND g.is_active = TRUE AND u.is_active = TRUE`,
      [id]
    );
    return toGraduate(rows[0]);
  }

  async findByUserId(userId) {
    const { rows } = await this.pool.query(
      `SELECT g.*, u.email_verified FROM graduates g JOIN users u ON u.id = g.user_id
       WHERE g.user_id = $1 AND g.is_active = TRUE AND u.is_active = TRUE`,
      [userId],
    );
    return toGraduate(rows[0]);
  }

  async findByRegistrationCode(code) {
    const { rows } = await this.pool.query(
      `SELECT g.*, u.email_verified FROM graduates g JOIN users u ON u.id = g.user_id
       WHERE g.registration_code = $1 AND g.is_active = TRUE AND u.is_active = TRUE`,
      [code]
    );
    return toGraduate(rows[0]);
  }

  async create({ userId, registrationCode, firstName, lastName, graduationYear, visibility }, client = this.pool) {
    const { rows } = await client.query(
      `INSERT INTO graduates (user_id, registration_code, first_name, last_name, graduation_year, visibility)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, registrationCode, firstName, lastName, graduationYear, visibility]
    );
    return toGraduate(rows[0]);
  }

  async update(id, changes, isUserEdit = false) {
    const setClauses = [];
    const values = [];
    let index = 1;

    for (const [key, value] of Object.entries(changes)) {
      const column = UPDATABLE_FIELDS[key];
      if (!column) continue;
      setClauses.push(`"${column}" = $${index}`);
      if (column === "professional_links") {
        values.push(JSON.stringify(value || []));
      } else {
        values.push(value);
      }
      index += 1;
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    // Regla de negocio: si el usuario edita su perfil, la ficha se despublica y regresa a borrador/revisión
    if (isUserEdit) {
      setClauses.push(`visibility = 'private'`);
      setClauses.push(`moderation_status = 'draft'`);
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const { rows } = await this.pool.query(
      `UPDATE graduates SET ${setClauses.join(", ")} WHERE id = $${index} RETURNING *`,
      values
    );
    return toGraduate(rows[0]);
  }

  /**
   * Busqueda del directorio con filtros y paginacion.
   * ILIKE + joins parametrizados, tal como recomienda el MVP.
   */
  async searchDirectory({
    q,
    technology,
    graduationYear,
    yearFrom,
    yearTo,
    page = 1,
    limit = 9,
    visibility,
    includeInactive = false,
  }) {
    const conditions = [];
    const values = [];
    let index = 1;

    if (!includeInactive) {
      conditions.push(`g.is_active = TRUE AND EXISTS (
        SELECT 1 FROM users active_user
        WHERE active_user.id = g.user_id AND active_user.is_active = TRUE
      )`);
    }

    if (visibility) {
      conditions.push(`g.visibility = $${index}`);
      values.push(visibility);
      index += 1;
    }

    if (graduationYear) {
      conditions.push(`g.graduation_year = $${index}`);
      values.push(graduationYear);
      index += 1;
    }

    if (yearFrom) {
      conditions.push(`g.graduation_year >= $${index}`);
      values.push(yearFrom);
      index += 1;
    }

    if (yearTo) {
      conditions.push(`g.graduation_year <= $${index}`);
      values.push(yearTo);
      index += 1;
    }

    if (technology) {
      conditions.push(`EXISTS (
        SELECT 1 FROM graduate_technologies gt
        JOIN technologies t ON t.id = gt.technology_id
        WHERE gt.graduate_id = g.id AND t.slug = $${index} AND t.is_active = TRUE
      )`);
      values.push(technology);
      index += 1;
    }

    if (q) {
      const escapedQ = q.replace(/[\\%_]/g, "\\$&");
      conditions.push(`(
        g.first_name ILIKE $${index} ESCAPE '\\' OR
        g.last_name ILIKE $${index} ESCAPE '\\' OR
        g.current_role ILIKE $${index} ESCAPE '\\' OR
        g.professional_summary ILIKE $${index} ESCAPE '\\' OR
        EXISTS (
          SELECT 1 FROM graduate_technologies gt2
          JOIN technologies t2 ON t2.id = gt2.technology_id
          WHERE gt2.graduate_id = g.id AND t2.name ILIKE $${index} ESCAPE '\\' AND t2.is_active = TRUE
        ) OR
        EXISTS (
          SELECT 1 FROM graduate_soft_skills gs2
          JOIN soft_skills s2 ON s2.id = gs2.soft_skill_id
          WHERE gs2.graduate_id = g.id AND s2.name ILIKE $${index} ESCAPE '\\' AND s2.is_active = TRUE
        ) OR
        EXISTS (
          SELECT 1 FROM certificates ce2
          WHERE ce2.graduate_id = g.id
            AND (ce2.title ILIKE $${index} ESCAPE '\\' OR ce2.issuer ILIKE $${index} ESCAPE '\\')
            AND ce2.is_active = TRUE
        )
      )`);
      values.push(`%${escapedQ}%`);
      index += 1;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await this.pool.query(
      `SELECT COUNT(*) FROM graduates g ${whereClause}`,
      values
    );
    const total = Number(countResult.rows[0].count);

    const offset = (page - 1) * limit;
    const dataValues = [...values, limit, offset];

    const { rows } = await this.pool.query(
      `SELECT g.*, u.email_verified FROM graduates g
       JOIN users u ON u.id = g.user_id
       ${whereClause}
       ORDER BY g.graduation_year DESC, g.last_name ASC, g.first_name ASC
       LIMIT $${index} OFFSET $${index + 1}`,
      dataValues
    );

    return {
      items: rows.map(toGraduate),
      page,
      limit,
      total,
    };
  }

  async setTechnologies(graduateId, technologyIds) {
    const uniqueIds = [...new Set(technologyIds)];
    return this._withTransaction(async (client) => {
      await client.query("DELETE FROM graduate_technologies WHERE graduate_id = $1", [graduateId]);
      let order = 0;
      for (const technologyId of uniqueIds) {
        await client.query(
          `INSERT INTO graduate_technologies (graduate_id, technology_id, display_order)
           SELECT $1, id, $3 FROM technologies WHERE id = $2
           ON CONFLICT (graduate_id, technology_id) DO UPDATE SET display_order = EXCLUDED.display_order`,
          [graduateId, technologyId, order]
        );
        order += 1;
      }
      return uniqueIds;
    });
  }

  async setSoftSkills(graduateId, softSkillIds) {
    const uniqueIds = [...new Set(softSkillIds)];
    return this._withTransaction(async (client) => {
      await client.query("DELETE FROM graduate_soft_skills WHERE graduate_id = $1", [graduateId]);
      let order = 0;
      for (const softSkillId of uniqueIds) {
        await client.query(
          `INSERT INTO graduate_soft_skills (graduate_id, soft_skill_id, display_order)
           SELECT $1, id, $3 FROM soft_skills WHERE id = $2
           ON CONFLICT (graduate_id, soft_skill_id) DO UPDATE SET display_order = EXCLUDED.display_order`,
          [graduateId, softSkillId, order]
        );
        order += 1;
      }
      return uniqueIds;
    });
  }

  async setProjects(graduateId, projects) {
    return this._withTransaction(async (client) => {
      await client.query("DELETE FROM projects WHERE graduate_id = $1", [graduateId]);
      let order = 0;
      for (const project of projects) {
        await client.query(
          `INSERT INTO projects (graduate_id, title, description, url, repository_url, display_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [graduateId, project.title, project.description ?? null, project.url ?? null, project.repositoryUrl ?? null, order]
        );
        order += 1;
      }
      return projects;
    });
  }

  async setExperiences(graduateId, experiences) {
    return this._withTransaction(async (client) => {
      await client.query("DELETE FROM experiences WHERE graduate_id = $1", [graduateId]);
      let order = 0;
      for (const exp of experiences) {
        await client.query(
          `INSERT INTO experiences (graduate_id, position, organization, category, start_date, end_date, date_format, is_current, description, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            graduateId,
            exp.position,
            exp.organization,
            exp.category || "work",
            exp.startDate ?? null,
            exp.endDate ?? null,
            exp.dateFormat === "month" ? "month" : "day",
            exp.isCurrent ?? false,
            exp.description ?? null,
            order,
          ]
        );
        order += 1;
      }
      return experiences;
    });
  }

  async setCertificates(graduateId, certificates) {
    return this._withTransaction(async (client) => {
      await client.query("DELETE FROM certificates WHERE graduate_id = $1", [graduateId]);
      let order = 0;
      for (const cert of certificates) {
        await client.query(
          `INSERT INTO certificates (graduate_id, title, formation_type, issuer, issue_date, credential_url, file_url, file_name, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            graduateId,
            cert.title,
            cert.formationType || "courses",
            cert.issuer ?? null,
            cert.issueDate ?? null,
            cert.credentialUrl ?? null,
            cert.fileUrl ?? null,
            cert.fileName ?? null,
            order,
          ]
        );
        order += 1;
      }
      return certificates;
    });
  }

  async setLanguages(graduateId, languages) {
    return this._withTransaction(async (client) => {
      await client.query("DELETE FROM graduate_languages WHERE graduate_id = $1", [graduateId]);
      let order = 0;
      for (const item of languages) {
        await client.query(
          `INSERT INTO graduate_languages (graduate_id, language_id, level, display_order)
           VALUES ($1, $2, $3, $4)`,
          [graduateId, item.languageId, item.level, item.displayOrder ?? order]
        );
        order += 1;
      }
      return languages;
    });
  }

  async getFullProfile(graduateId) {
    const [technologies, softSkills, languages, projects, experiences, certificates, recommendations] = await Promise.all([
      this.pool.query(
        `SELECT t.id, t.name, t.slug, t.specialty FROM graduate_technologies gt
         JOIN technologies t ON t.id = gt.technology_id
         WHERE gt.graduate_id = $1 AND t.is_active = TRUE ORDER BY gt.display_order`,
        [graduateId]
      ),
      this.pool.query(
        `SELECT s.id, s.name, s.slug FROM graduate_soft_skills gs
         JOIN soft_skills s ON s.id = gs.soft_skill_id
         WHERE gs.graduate_id = $1 AND s.is_active = TRUE ORDER BY gs.display_order`,
        [graduateId]
      ),
      this.pool.query(
        `SELECT gl.id, l.id AS "languageId", l.name, l.slug, gl.level, gl.display_order
         FROM graduate_languages gl
         JOIN languages l ON l.id = gl.language_id
         WHERE gl.graduate_id = $1 AND l.is_active = TRUE
         ORDER BY gl.display_order ASC, l.name ASC`,
        [graduateId]
      ),
      this.pool.query(
        `SELECT * FROM projects WHERE graduate_id = $1 AND is_active = TRUE ORDER BY display_order`,
        [graduateId]
      ),
      this.pool.query(
        `SELECT * FROM experiences WHERE graduate_id = $1 AND is_active = TRUE
         ORDER BY is_current DESC, COALESCE(end_date, start_date) DESC NULLS LAST, start_date DESC NULLS LAST, display_order ASC`,
        [graduateId]
      ),
      this.pool.query(
        `SELECT * FROM certificates WHERE graduate_id = $1 AND is_active = TRUE
         ORDER BY
           CASE formation_type
             WHEN 'doctorate' THEN 1
             WHEN 'master' THEN 2
             WHEN 'specialty' THEN 3
             WHEN 'diploma' THEN 4
             WHEN 'bachelor' THEN 5
             WHEN 'courses' THEN 6
             ELSE 7
           END ASC,
           issue_date DESC NULLS LAST,
           display_order ASC`,
        [graduateId]
      ),
      this.pool.query(
        `SELECT * FROM recommendations WHERE graduate_id = $1 AND status = 'published' AND is_active = TRUE ORDER BY created_at DESC`,
        [graduateId]
      ),
    ]);

    return {
      technologies: technologies.rows,
      softSkills: softSkills.rows,
      languages: languages.rows,
      projects: projects.rows,
      experiences: experiences.rows,
      certificates: certificates.rows,
      recommendations: recommendations.rows,
    };
  }

  async requestPublish(id) {
    const { rows } = await this.pool.query(
      `UPDATE graduates
       SET moderation_status = 'pending_review',
           moderation_updated_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return toGraduate(rows[0]);
  }

  async setModeration(id, { status, observations = null, visibility = null }) {
    const setClauses = [
      `moderation_status = $2`,
      `moderation_observations = $3`,
      `moderation_updated_at = NOW()`,
      `updated_at = NOW()`,
    ];
    const values = [id, status, observations];
    let nextIdx = 4;

    if (visibility) {
      setClauses.push(`visibility = $${nextIdx}`);
      values.push(visibility);
      nextIdx += 1;
    }

    const { rows } = await this.pool.query(
      `UPDATE graduates SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
      values
    );
    return toGraduate(rows[0]);
  }
}
