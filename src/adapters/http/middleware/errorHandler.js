import { AppError } from "../../../shared/errors/AppError.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error("Error no controlado:", err);
  return res.status(500).json({ error: "Error interno del servidor" });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Ruta no encontrada" });
}
