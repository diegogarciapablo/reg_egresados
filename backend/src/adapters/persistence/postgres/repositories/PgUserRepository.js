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
    emailVerified: row.email_verified,
    termsAcceptedAt: row.terms_accepted_at,
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

  async createVerificationToken(userId, tokenHash, expiresAt) {
    await this.pool.query("DELETE FROM email_verification_tokens WHERE user_id = $1 OR expires_at < NOW()", [userId]);
    await this.pool.query(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  }

  async findVerificationToken(tokenHash) {
    const { rows } = await this.pool.query(
      `SELECT t.*, u.email, u.email_verified
       FROM email_verification_tokens t
       JOIN users u ON u.id = t.user_id
       WHERE t.token_hash = $1 AND t.expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  async setEmailVerified(userId) {
    await this.pool.query(
      "UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE id = $1",
      [userId]
    );
    await this.pool.query("DELETE FROM email_verification_tokens WHERE user_id = $1", [userId]);
  }

  async acceptTerms(userId) {
    const { rows } = await this.pool.query(
      "UPDATE users SET terms_accepted_at = NOW() WHERE id = $1 RETURNING *",
      [userId]
    );
    return toUser(rows[0]);
  }

  async listAdmins() {
    const { rows } = await this.pool.query(
      "SELECT * FROM users WHERE role = 'admin' AND is_active = TRUE"
    );
    return rows.map(toUser);
  }
}
