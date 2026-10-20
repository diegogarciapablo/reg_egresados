import { RecommendationRepository } from "../../../../domain/recommendation/recommendationRepository.js";

export class PgRecommendationRepository extends RecommendationRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async listPublishedByGraduate(graduateId) {
    const { rows } = await this.pool.query(
      `SELECT * FROM recommendations WHERE graduate_id = $1 AND status = 'published' AND is_active = TRUE ORDER BY created_at DESC`,
      [graduateId]
    );
    return rows;
  }

  async create({ graduateId, authorName, authorRole, message, status }) {
    const { rows } = await this.pool.query(
      `INSERT INTO recommendations (graduate_id, author_name, author_role, message, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [graduateId, authorName, authorRole ?? null, message, status]
    );
    return rows[0];
  }

  async updateStatus(id, status) {
    const { rows } = await this.pool.query(
      `UPDATE recommendations SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return rows[0];
  }
}
