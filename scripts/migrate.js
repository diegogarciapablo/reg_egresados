import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../src/config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "migrations");

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const existingSchema = await client.query(
      "SELECT to_regclass('public.graduates') IS NOT NULL AS exists",
    );
    if (existingSchema.rows[0].exists) {
      await client.query(
        `INSERT INTO schema_migrations (name)
         VALUES ('001_initial_schema.sql')
         ON CONFLICT (name) DO NOTHING`,
      );
    }

    const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();

    console.log(`Encontradas ${files.length} migraciones`);

    for (const file of files) {
      const applied = await client.query(
        "SELECT 1 FROM schema_migrations WHERE name = $1",
        [file],
      );
      if (applied.rowCount > 0) {
        console.log(`Omitiendo ${file}; ya fue aplicada.`);
        continue;
      }

      const sql = await readFile(path.join(migrationsDir, file), "utf-8");
      console.log(`Aplicando ${file}...`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`OK: ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    client.release();
  }

  console.log("Migraciones completas.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runMigrations()
    .catch((err) => {
      console.error("Error al migrar:", err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
