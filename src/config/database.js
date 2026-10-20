import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de Postgres", err);
});

/**
 * Ejecuta una consulta simple (sin transaccion).
 */
export async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Ejecuta un bloque de operaciones dentro de una transaccion.
 * callback recibe un "client" con el que se deben hacer todas las queries.
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
