import dotenv from "dotenv";

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(required("PORT", "3000")),
  nodeEnv: required("NODE_ENV", "development"),
  sessionSecret: required("SESSION_SECRET"),
  db: {
    host: required("DB_HOST", "localhost"),
    port: Number(required("DB_PORT", "5432")),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    database: required("DB_NAME"),
  },
};
