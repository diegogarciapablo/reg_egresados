import { NotificationRepository } from "../../../../domain/notification/notificationRepository.js";

export class PgNotificationRepository extends NotificationRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async create({ userId, title, message, link = null, type = "info" }) {
    const { rows } = await this.pool.query(
      `INSERT INTO notifications (user_id, title, message, link, type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, message, link, type]
    );
    return rows[0];
  }

  async listByUser(userId, { limit = 20 } = {}) {
    const { rows } = await this.pool.query(
      `SELECT id, title, message, link, type, is_read AS "isRead", created_at AS "createdAt"
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  async markAsRead(id, userId) {
    const { rows } = await this.pool.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, is_read AS "isRead"`,
      [id, userId]
    );
    return rows[0] || null;
  }

  async markAllAsRead(userId) {
    await this.pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1`,
      [userId]
    );
    return { success: true };
  }

  async countUnread(userId) {
    const { rows } = await this.pool.query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return rows[0]?.count || 0;
  }
}
