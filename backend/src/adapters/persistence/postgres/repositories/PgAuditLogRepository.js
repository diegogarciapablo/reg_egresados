export class PgAuditLogRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create(
    {
      userId,
      userEmail,
      userRole = "graduate",
      entityType,
      entityId = null,
      action,
      details = null,
      beforeState = null,
      afterState = null,
      ipAddress = null,
    },
    client = this.pool
  ) {
    const { rows } = await client.query(
      `INSERT INTO audit_logs (
        user_id, user_email, user_role, entity_type, entity_id, action, details, before_state, after_state, ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId || null,
        userEmail || "desconocido",
        userRole,
        entityType,
        entityId ? String(entityId) : null,
        action,
        details,
        beforeState ? JSON.stringify(beforeState) : null,
        afterState ? JSON.stringify(afterState) : null,
        ipAddress,
      ]
    );
    return rows[0];
  }

  async list({ limit = 50, offset = 0, entityType, action } = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (entityType) {
      conditions.push(`entity_type = $${idx++}`);
      values.push(entityType);
    }
    if (action) {
      conditions.push(`action = $${idx++}`);
      values.push(action);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    values.push(limit, offset);

    const { rows } = await this.pool.query(
      `SELECT
        id,
        user_id AS "userId",
        user_email AS "userEmail",
        user_role AS "userRole",
        entity_type AS "entityType",
        entity_id AS "entityId",
        action,
        details,
        before_state AS "beforeState",
        after_state AS "afterState",
        ip_address AS "ipAddress",
        created_at AS "createdAt"
       FROM audit_logs
       ${where}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values
    );

    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int AS total FROM audit_logs ${where}`,
      values.slice(0, conditions.length)
    );

    return {
      items: rows,
      total: countRes.rows[0]?.total || 0,
      limit,
      offset,
    };
  }
}
