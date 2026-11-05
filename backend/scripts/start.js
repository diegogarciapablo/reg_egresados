import { setTimeout as delay } from "node:timers/promises";
import { pool } from "../src/config/database.js";
import { runMigrations } from "./migrate.js";
import { runSeed } from "./seed.js";

async function waitForDatabase() {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (error) {
      if (attempt === 30) throw error;
      console.log(`Esperando a PostgreSQL (${attempt}/30)...`);
      await delay(1000);
    }
  }
}

try {
  await waitForDatabase();
  await runMigrations();
  await runSeed();
  await import("../src/server.js");
} catch (error) {
  console.error("No se pudo inicializar la aplicacion:", error);
  await pool.end();
  process.exit(1);
}