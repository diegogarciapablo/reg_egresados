import dotenv from "dotenv";

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno: ${name}`);
  }
  return value;
}

const nodeEnv = required("NODE_ENV", "development");
const sessionSecret = required("SESSION_SECRET");

if (
  nodeEnv === "production" &&
  (sessionSecret.length < 32 || sessionSecret === "cambia-este-valor-por-uno-largo-y-aleatorio")
) {
  throw new Error("En produccion SESSION_SECRET debe tener al menos 32 caracteres aleatorios.");
}

export const env = {
  port: Number(required("PORT", "3000")),
  nodeEnv,
  sessionSecret,
  corsOrigin: process.env.CORS_ORIGIN || false,
  db: {
    host: required("DB_HOST", "localhost"),
    port: Number(required("DB_PORT", "5432")),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),
  },
};
