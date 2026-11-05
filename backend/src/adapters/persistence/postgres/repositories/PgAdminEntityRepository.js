import { AdminEntityRepository } from "../../../../domain/admin/adminEntityRepository.js";
import { getEntityConfig, getEntityDefinitions } from "../../../../domain/admin/adminEntitySchemas.js";
import { AppError, ConflictError, NotFoundError } from "../../../../shared/errors/AppError.js";

function buildSelect(config) {
  const columns = config.columns.map(({ key, sql }) => `${sql} AS "${key}"`);
  return `${config.alias}.id, ${config.alias}.is_active, ${columns.join(", ")}`;
}

export class PgAdminEntityRepository extends AdminEntityRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  definitions() {
    return getEntityDefinitions();
  }

  async list(entity, search = "") {
    const config = getEntityConfig(entity);
    const values = [];
    let where = "";
    if (search.trim()) {
      const escapedSearch = search.trim().replace(/[\\%_]/g, "\\$&");
      values.push(`%${escapedSearch}%`);
      const searchColumns = config.columns
        .map(({ sql }) => `COALESCE((${sql})::text, '') ILIKE $1 ESCAPE '\\'`)
        .concat([
          `${config.alias}.id::text ILIKE $1 ESCAPE '\\'`,
          `COALESCE(${config.alias}.is_active::text, '') ILIKE $1 ESCAPE '\\'`,
        ]);
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

  async listById(entity, id) {
    const config = getEntityConfig(entity);
    return this.pool.query(
      `SELECT ${buildSelect(config)} FROM ${config.from} WHERE ${config.alias}.id = $1`,
      [id],
    );
  }

  async countOtherActiveAdmins(excludedUserId) {
    const { rows } = await this.pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = TRUE AND id <> $1",
      [excludedUserId],
    );
    return Number(rows[0].count);
  }

  async create(entity, normalizedFields) {
    const config = getEntityConfig(entity);
    const columnNames = normalizedFields.map(({ field }) => `"${field.key}"`);
    const placeholders = normalizedFields.map((_, index) => `$${index + 1}`);
    const values = normalizedFields.map(({ value }) => value);

    let createdId;
    try {
      const result = await this.pool.query(
        `INSERT INTO ${config.table} (${columnNames.join(", ")})
         VALUES (${placeholders.join(", ")})
         RETURNING id`,
        values,
      );
      createdId = result.rows[0].id;
    } catch (error) {
      if (error.code === "23505") throw new ConflictError("Ya existe un registro con esos datos unicos.");
      if (error.code === "23514" || error.code === "23503") throw new AppError("Los datos no cumplen las restricciones del registro.");
      throw error;
    }

    const { rows } = await this.listById(entity, createdId);
    return rows[0];
  }

  async update(entity, id, normalizedChanges) {
    const config = getEntityConfig(entity);
    const setClauses = normalizedChanges.map(({ field }, index) => `"${field.key}" = $${index + 1}`);
    const values = normalizedChanges.map(({ value }) => value);
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

  async setActive(entity, id, isActive) {
    const config = getEntityConfig(entity);
    const result = await this.pool.query(
      `UPDATE ${config.table} SET is_active = $1${config.updatesTimestamp ? ", updated_at = NOW()" : ""} WHERE id = $2 RETURNING is_active`,
      [isActive, id],
    );
    if (!result.rowCount) throw new NotFoundError("Registro no encontrado");
    return { isActive: result.rows[0].is_active };
  }
}
