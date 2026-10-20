import { AppError, ConflictError, NotFoundError } from "../../../../shared/errors/AppError.js";

const entities = {
  users: {
    label: "Usuarios",
    table: "users",
    alias: "u",
    from: "users u",
    orderBy: "u.created_at DESC",
    updatesTimestamp: true,
    columns: [
      { key: "email", label: "Correo", sql: "u.email", type: "email", required: true, maxLength: 254 },
      { key: "role", label: "Rol", sql: "u.role", type: "select", required: true, options: ["graduate", "admin"] },
      { key: "last_login_at", label: "Ultimo acceso", sql: "u.last_login_at", type: "datetime" },
      { key: "created_at", label: "Creado", sql: "u.created_at", type: "datetime" },
    ],
  },
  graduates: {
    label: "Perfiles",
    table: "graduates",
    alias: "g",
    from: "graduates g JOIN users u ON u.id = g.user_id",
    orderBy: "g.last_name, g.first_name",
    updatesTimestamp: true,
    columns: [
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      { key: "registration_code", label: "Codigo", sql: "g.registration_code", type: "text", required: true, maxLength: 30 },
      { key: "first_name", label: "Nombres", sql: "g.first_name", type: "text", required: true, maxLength: 100 },
      { key: "last_name", label: "Apellidos", sql: "g.last_name", type: "text", required: true, maxLength: 150 },
      { key: "current_role", label: "Cargo actual", sql: "g.current_role", type: "text", nullable: true, maxLength: 150 },
      { key: "graduation_year", label: "Ano de egreso", sql: "g.graduation_year", type: "number", required: true },
      { key: "professional_summary", label: "Resumen", sql: "g.professional_summary", type: "textarea", nullable: true, maxLength: 1000 },
      { key: "visibility", label: "Visibilidad", sql: "g.visibility", type: "select", required: true, options: ["public", "link_only", "private"] },
      { key: "github_url", label: "GitHub", sql: "g.github_url", type: "url", nullable: true },
      { key: "linkedin_url", label: "LinkedIn", sql: "g.linkedin_url", type: "url", nullable: true },
      { key: "portfolio_url", label: "Portafolio", sql: "g.portfolio_url", type: "url", nullable: true },
      { key: "created_at", label: "Creado", sql: "g.created_at", type: "datetime" },
    ],
  },
  technologies: {
    label: "Tecnologias",
    table: "technologies",
    alias: "t",
    from: "technologies t",
    orderBy: "t.name",
    columns: [
      { key: "name", label: "Nombre", sql: "t.name", type: "text", required: true, maxLength: 80 },
      { key: "slug", label: "Slug", sql: "t.slug", type: "text", required: true, maxLength: 80 },
    ],
  },
  soft_skills: {
    label: "Habilidades blandas",
    table: "soft_skills",
    alias: "s",
    from: "soft_skills s",
    orderBy: "s.name",
    columns: [
      { key: "name", label: "Nombre", sql: "s.name", type: "text", required: true, maxLength: 100 },
      { key: "slug", label: "Slug", sql: "s.slug", type: "text", required: true, maxLength: 100 },
    ],
  },
  projects: {
    label: "Proyectos",
    table: "projects",
    alias: "p",
    from: "projects p JOIN graduates g ON g.id = p.graduate_id JOIN users u ON u.id = g.user_id",
    orderBy: "p.created_at DESC",
    updatesTimestamp: true,
    columns: [
      { key: "graduate", label: "Perfil", sql: "concat_ws(' ', g.first_name, g.last_name)", type: "text", editable: false },
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      { key: "title", label: "Titulo", sql: "p.title", type: "text", required: true, maxLength: 150 },
      { key: "description", label: "Descripcion", sql: "p.description", type: "textarea", nullable: true, maxLength: 2000 },
      { key: "url", label: "URL", sql: "p.url", type: "url", nullable: true },
      { key: "repository_url", label: "Repositorio", sql: "p.repository_url", type: "url", nullable: true },
      { key: "display_order", label: "Orden", sql: "p.display_order", type: "number", required: true },
      { key: "created_at", label: "Creado", sql: "p.created_at", type: "datetime" },
    ],
  },
  experiences: {
    label: "Experiencias",
    table: "experiences",
    alias: "e",
    from: "experiences e JOIN graduates g ON g.id = e.graduate_id JOIN users u ON u.id = g.user_id",
    orderBy: "e.start_date DESC NULLS LAST",
    columns: [
      { key: "graduate", label: "Perfil", sql: "concat_ws(' ', g.first_name, g.last_name)", type: "text", editable: false },
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      { key: "position", label: "Puesto", sql: "e.position", type: "text", required: true, maxLength: 150 },
      { key: "organization", label: "Organizacion", sql: "e.organization", type: "text", required: true, maxLength: 150 },
      { key: "start_date", label: "Inicio", sql: "e.start_date", type: "date", nullable: true },
      { key: "end_date", label: "Fin", sql: "e.end_date", type: "date", nullable: true },
      { key: "is_current", label: "Actual", sql: "e.is_current", type: "boolean", required: true },
      { key: "description", label: "Descripcion", sql: "e.description", type: "textarea", nullable: true, maxLength: 2000 },
      { key: "display_order", label: "Orden", sql: "e.display_order", type: "number", required: true },
    ],
  },
  recommendations: {
    label: "Recomendaciones",
    table: "recommendations",
    alias: "r",
    from: "recommendations r JOIN graduates g ON g.id = r.graduate_id JOIN users u ON u.id = g.user_id",
    orderBy: "r.created_at DESC",
    columns: [
      { key: "graduate", label: "Perfil", sql: "concat_ws(' ', g.first_name, g.last_name)", type: "text", editable: false },
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      { key: "author_name", label: "Autor", sql: "r.author_name", type: "text", required: true, maxLength: 150 },
      { key: "author_role", label: "Cargo del autor", sql: "r.author_role", type: "text", nullable: true, maxLength: 150 },
      { key: "message", label: "Mensaje", sql: "r.message", type: "textarea", required: true, maxLength: 1500 },
      { key: "status", label: "Estado", sql: "r.status", type: "select", required: true, options: ["pending", "published", "rejected"] },
      { key: "created_at", label: "Creado", sql: "r.created_at", type: "datetime" },
    ],
  },
  cover_letters: {
    label: "Cartas de presentacion",
    table: "cover_letters",
    alias: "c",
    from: "cover_letters c JOIN graduates g ON g.id = c.graduate_id JOIN users u ON u.id = g.user_id",
    orderBy: "c.updated_at DESC",
    updatesTimestamp: true,
    columns: [
      { key: "graduate", label: "Perfil", sql: "concat_ws(' ', g.first_name, g.last_name)", type: "text", editable: false },
      { key: "account_email", label: "Cuenta", sql: "u.email", type: "text", editable: false },
      { key: "full_name", label: "Nombre completo", sql: "c.full_name", type: "text", required: true, maxLength: 200 },
      { key: "company_name", label: "Empresa", sql: "c.company_name", type: "text", required: true, maxLength: 150 },
      { key: "target_position", label: "Puesto", sql: "c.target_position", type: "text", required: true, maxLength: 150 },
      { key: "email", label: "Correo", sql: "c.email", type: "email", nullable: true, maxLength: 254 },
      { key: "phone", label: "Telefono", sql: "c.phone", type: "text", nullable: true, maxLength: 40 },
      { key: "city_country", label: "Ciudad y pais", sql: "c.city_country", type: "text", nullable: true, maxLength: 150 },
      { key: "sending_city", label: "Ciudad de envio", sql: "c.sending_city", type: "text", nullable: true, maxLength: 100 },
      { key: "sending_date", label: "Fecha de envio", sql: "c.sending_date", type: "date", nullable: true },
      { key: "recruiter_name", label: "Reclutador", sql: "c.recruiter_name", type: "text", nullable: true, maxLength: 150 },
      { key: "recruiter_role", label: "Cargo del reclutador", sql: "c.recruiter_role", type: "text", nullable: true, maxLength: 150 },
      { key: "job_source", label: "Fuente", sql: "c.job_source", type: "text", nullable: true, maxLength: 150 },
      { key: "career", label: "Carrera", sql: "c.career", type: "text", nullable: true, maxLength: 150 },
      { key: "university", label: "Universidad", sql: "c.university", type: "text", nullable: true, maxLength: 150 },
      { key: "specialty", label: "Especialidad", sql: "c.specialty", type: "text", nullable: true, maxLength: 100 },
      { key: "relevant_experience", label: "Experiencia relevante", sql: "c.relevant_experience", type: "textarea", nullable: true, maxLength: 2000 },
      { key: "motivation", label: "Motivacion", sql: "c.motivation", type: "textarea", nullable: true, maxLength: 2000 },
      { key: "value_proposition", label: "Valor ofrecido", sql: "c.value_proposition", type: "textarea", nullable: true, maxLength: 2000 },
      { key: "status", label: "Estado", sql: "c.status", type: "select", required: true, options: ["draft", "archived"] },
      { key: "created_at", label: "Creada", sql: "c.created_at", type: "datetime" },
      { key: "updated_at", label: "Actualizada", sql: "c.updated_at", type: "datetime" },
    ],
  },
};

function getConfig(entity) {
  const config = entities[entity];
  if (!config) throw new NotFoundError("Entidad no encontrada");
  return config;
}

function buildSelect(config) {
  const columns = config.columns.map(({ key, sql }) => `${sql} AS "${key}"`);
  return `${config.alias}.id, ${config.alias}.is_active, ${columns.join(", ")}`;
}

function normalizeField(field, value) {
  if ((value === null || value === "") && field.nullable) return null;
  if (value === null || value === "") {
    if (field.required) throw new AppError(`${field.label} es obligatorio.`);
    return null;
  }
  if (field.type === "number") {
    const number = Number(value);
    if (!Number.isInteger(number)) throw new AppError(`${field.label} debe ser un numero entero.`);
    return number;
  }
  if (field.type === "boolean") {
    if (typeof value !== "boolean") throw new AppError(`${field.label} debe ser booleano.`);
    return value;
  }
  if (field.type === "select" && !field.options.includes(value)) {
    throw new AppError(`Valor no valido para ${field.label}.`);
  }
  if (typeof value !== "string") throw new AppError(`${field.label} debe ser texto.`);
  if (field.maxLength && value.length > field.maxLength) {
    throw new AppError(`${field.label} supera el maximo de ${field.maxLength} caracteres.`);
  }
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new AppError("El correo no tiene un formato valido.");
  }
  return value;
}

export class PgAdminEntityRepository {
  constructor(pool) {
    this.pool = pool;
  }

  definitions() {
    return Object.entries(entities).map(([key, config]) => ({
      key,
      label: config.label,
      columns: config.columns.map(({ key: columnKey, label, type }) => ({
        key: columnKey,
        label,
        type,
      })),
      fields: config.columns
        .filter((field) => field.editable !== false && !["datetime"].includes(field.type))
        .map(({ key: fieldKey, label, type, required, nullable, maxLength, options }) => ({
          key: fieldKey,
          label,
          type,
          required: Boolean(required),
          nullable: Boolean(nullable),
          maxLength,
          options,
        })),
    }));
  }

  async list(entity, search = "") {
    const config = getConfig(entity);
    const values = [];
    let where = "";
    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      const searchColumns = config.columns
        .map(({ sql }) => `COALESCE((${sql})::text, '') ILIKE $1`)
        .concat([`${config.alias}.id::text ILIKE $1`, `COALESCE(${config.alias}.is_active::text, '') ILIKE $1`]);
      where = `WHERE (${searchColumns.join(" OR ")})`;
    }

    const { rows } = await this.pool.query(
      `SELECT ${buildSelect(config)}
       FROM ${config.from}
       ${where}
       ORDER BY ${config.orderBy}`,
      values,
    );
    return rows;
  }

  async update(entity, id, changes) {
    const config = getConfig(entity);
    if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
      throw new AppError("Debes enviar campos para editar.");
    }
    if (entity === "users" && changes.role && changes.role !== "admin") {
      const activeAdmins = await this.pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = TRUE AND id <> $1",
        [id],
      );
      if (Number(activeAdmins.rows[0].count) === 0) {
        throw new ConflictError("Debe permanecer al menos un administrador activo.");
      }
    }

    const editableFields = config.columns.filter((field) => field.editable !== false && field.type !== "datetime");
    const normalized = [];
    for (const [key, value] of Object.entries(changes)) {
      const field = editableFields.find((candidate) => candidate.key === key);
      if (!field) throw new AppError(`No se permite editar el campo ${key}.`);
      normalized.push({ field, value: normalizeField(field, value) });
    }
    if (!normalized.length) throw new AppError("No hay campos editables en la solicitud.");

    const setClauses = normalized.map(({ field }, index) => `${field.key} = $${index + 1}`);
    const values = normalized.map(({ value }) => value);
    if (config.updatesTimestamp) setClauses.push("updated_at = NOW()");
    values.push(id);

    try {
      const result = await this.pool.query(
        `UPDATE ${config.table}
         SET ${setClauses.join(", ")}
         WHERE id = $${values.length}
         RETURNING id`,
        values,
      );
      if (!result.rowCount) throw new NotFoundError("Registro no encontrado");
    } catch (error) {
      if (error.code === "23505") throw new ConflictError("Ya existe un registro con esos datos unicos.");
      if (error.code === "23514" || error.code === "23503") throw new AppError("Los datos no cumplen las restricciones del registro.");
      throw error;
    }

    const { rows } = await this.listById(entity, id);
    return rows;
  }

  async listById(entity, id) {
    const config = getConfig(entity);
    return this.pool.query(
      `SELECT ${buildSelect(config)} FROM ${config.from} WHERE ${config.alias}.id = $1`,
      [id],
    );
  }

  async setActive(entity, id, isActive, actorId) {
    const config = getConfig(entity);
    if (typeof isActive !== "boolean") throw new AppError("El estado debe ser verdadero o falso.");
    if (entity === "users" && !isActive) {
      if (id === actorId) throw new ConflictError("No puedes deshabilitar tu propia cuenta.");
      const otherAdmins = await this.pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = TRUE AND id <> $1",
        [id],
      );
      if (Number(otherAdmins.rows[0].count) === 0) {
        throw new ConflictError("Debe permanecer al menos un administrador activo.");
      }
    }

    const result = await this.pool.query(
      `UPDATE ${config.table} SET is_active = $1${config.updatesTimestamp ? ", updated_at = NOW()" : ""} WHERE id = $2 RETURNING is_active`,
      [isActive, id],
    );
    if (!result.rowCount) throw new NotFoundError("Registro no encontrado");
    return { isActive: result.rows[0].is_active };
  }
}