import bcrypt from "bcrypt";
import { pool } from "../src/config/database.js";

async function createAdminOnly() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.test";
  const adminPassword = process.env.ADMIN_PASSWORD || "Prueba123!";
  const firstName = "Administrador";
  const lastName = "Sistema";
  const regCode = "EG-ADMIN-001";

  const client = await pool.connect();
  try {
    console.log("Verificando existencia de cuenta administrativa...");
    const existing = await client.query("SELECT id FROM users WHERE email = $1", [adminEmail]);

    let adminUserId;
    if (existing.rowCount === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const res = await client.query(
        `INSERT INTO users (email, password_hash, role, is_active, email_verified, terms_accepted_at)
         VALUES ($1, $2, 'admin', TRUE, TRUE, NOW())
         RETURNING id`,
        [adminEmail, passwordHash]
      );
      adminUserId = res.rows[0].id;
      console.log(`\n==================================================`);
      console.log(`Cuenta de Administrador creada exitosamente:`);
      console.log(`Correo:     ${adminEmail}`);
      console.log(`Contraseña: ${adminPassword}`);
      console.log(`==================================================\n`);
    } else {
      adminUserId = existing.rows[0].id;
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await client.query(
        `UPDATE users
         SET role = 'admin', password_hash = $2, is_active = TRUE, email_verified = TRUE, terms_accepted_at = NOW()
         WHERE id = $1`,
        [adminUserId, passwordHash]
      );
      console.log(`\n==================================================`);
      console.log(`Cuenta de Administrador actualizada:`);
      console.log(`Correo:     ${adminEmail}`);
      console.log(`Contraseña restablecida a: ${adminPassword}`);
      console.log(`==================================================\n`);
    }

    await client.query(
      `INSERT INTO graduates
        (user_id, registration_code, first_name, last_name, "current_role", graduation_year, professional_summary, visibility, moderation_status)
       VALUES ($1, $2, $3, $4, $5, 2020, 'Cuenta administrativa del sistema.', 'private', 'approved')
       ON CONFLICT (user_id) DO NOTHING`,
      [adminUserId, regCode, firstName, lastName, "Administrador de Carrera"]
    );

    console.log("Perfil asociado al administrador configurado correctamente.");
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminOnly().catch((err) => {
  console.error("Error al crear cuenta administrativa:", err);
  process.exitCode = 1;
});
