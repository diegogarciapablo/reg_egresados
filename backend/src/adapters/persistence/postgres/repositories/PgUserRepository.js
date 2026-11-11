import { UserRepository } from "../../../../domain/user/userRepository.js";
import { User } from "../../../../domain/user/User.js";

function toUser(row) {
  if (!row) return null;
  return new User({
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    isActive: row.is_active,
  });
}

export class PgUserRepository extends UserRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async findByEmail(email) {
    const { rows } = await this.pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return toUser(rows[0]);
  }

  async findById(id) {
    const { rows } = await this.pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return toUser(rows[0]);
  }

  async create({ email, passwordHash, role }, client = this.pool) {
    const { rows } = await client.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [email, passwordHash, role]
    );
    return toUser(rows[0]);
  }

  async updateLastLogin(id) {
    await this.pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id]);
  }

  async updatePassword(id, passwordHash) {
    await this.pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, id]);
  }
}
