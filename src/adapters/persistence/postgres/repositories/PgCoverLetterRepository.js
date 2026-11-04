import { CoverLetterRepository } from "../../../../domain/coverLetter/coverLetterRepository.js";
import { CoverLetter } from "../../../../domain/coverLetter/CoverLetter.js";

const FIELD_MAP = {
  fullName: "full_name",
  cityCountry: "city_country",
  phone: "phone",
  email: "email",
  sendingCity: "sending_city",
  sendingDate: "sending_date",
  recruiterName: "recruiter_name",
  recruiterRole: "recruiter_role",
  companyName: "company_name",
  targetPosition: "target_position",
  jobSource: "job_source",
  career: "career",
  university: "university",
  specialty: "specialty",
  relevantExperience: "relevant_experience",
  motivation: "motivation",
  valueProposition: "value_proposition",
  status: "status",
};

function toCoverLetter(row) {
  if (!row) return null;
  const result = {
    id: row.id,
    graduateId: row.graduate_id,
    technologyIds: row.technology_ids || [],
    softSkillIds: row.soft_skill_ids || [],
  };
  for (const [camel, snake] of Object.entries(FIELD_MAP)) {
    result[camel] = row[snake];
  }
  return new CoverLetter(result);
}

export class PgCoverLetterRepository extends CoverLetterRepository {
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

  async listByGraduate(graduateId) {
    const { rows } = await this.pool.query(
      `SELECT cl.*,
        ARRAY(
          SELECT technology_id FROM cover_letter_technologies
          WHERE cover_letter_id = cl.id ORDER BY display_order
        ) AS technology_ids,
        ARRAY(
          SELECT soft_skill_id FROM cover_letter_soft_skills
          WHERE cover_letter_id = cl.id ORDER BY display_order
        ) AS soft_skill_ids
       FROM cover_letters cl
      WHERE cl.graduate_id = $1 AND cl.is_active = TRUE
       ORDER BY cl.updated_at DESC`,
      [graduateId]
    );
    return rows.map(toCoverLetter);
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      `SELECT cl.*,
        ARRAY(
          SELECT technology_id FROM cover_letter_technologies
          WHERE cover_letter_id = cl.id ORDER BY display_order
        ) AS technology_ids,
        ARRAY(
          SELECT soft_skill_id FROM cover_letter_soft_skills
          WHERE cover_letter_id = cl.id ORDER BY display_order
        ) AS soft_skill_ids
       FROM cover_letters cl
       WHERE cl.id = $1`,
      [id]
    );
    return toCoverLetter(rows[0]);
  }

  async create(data) {
    const columns = ["graduate_id"];
    const placeholders = ["$1"];
    const values = [data.graduateId];
    let index = 2;

    for (const [camel, snake] of Object.entries(FIELD_MAP)) {
      if (data[camel] === undefined) continue;
      columns.push(snake);
      placeholders.push(`$${index}`);
      values.push(data[camel]);
      index += 1;
    }

    const { rows } = await this.pool.query(
      `INSERT INTO cover_letters (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
      values
    );
    return toCoverLetter(rows[0]);
  }

  async update(id, changes) {
    const setClauses = [];
    const values = [];
    let index = 1;

    for (const [camel, snake] of Object.entries(FIELD_MAP)) {
      if (changes[camel] === undefined) continue;
      setClauses.push(`${snake} = $${index}`);
      values.push(changes[camel]);
      index += 1;
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push("updated_at = NOW()");
    values.push(id);

    const { rows } = await this.pool.query(
      `UPDATE cover_letters SET ${setClauses.join(", ")} WHERE id = $${index} RETURNING *`,
      values
    );
    return toCoverLetter(rows[0]);
  }

  async setSelections(coverLetterId, { technologyIds = [], softSkillIds = [] }) {
    return this._withTransaction(async (client) => {
      await client.query("DELETE FROM cover_letter_technologies WHERE cover_letter_id = $1", [coverLetterId]);
      await client.query("DELETE FROM cover_letter_soft_skills WHERE cover_letter_id = $1", [coverLetterId]);

      let order = 0;
      for (const technologyId of technologyIds) {
        await client.query(
          `INSERT INTO cover_letter_technologies (cover_letter_id, technology_id, display_order) VALUES ($1, $2, $3)`,
          [coverLetterId, technologyId, order]
        );
        order += 1;
      }

      order = 0;
      for (const softSkillId of softSkillIds) {
        await client.query(
          `INSERT INTO cover_letter_soft_skills (cover_letter_id, soft_skill_id, display_order) VALUES ($1, $2, $3)`,
          [coverLetterId, softSkillId, order]
        );
        order += 1;
      }

      return { technologyIds, softSkillIds };
    });
  }
}
