import { AppError } from "../../../shared/errors/AppError.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err?.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "El archivo supera el tamano maximo permitido."
        : "No se pudo procesar el archivo subido.";
    return res.status(400).json({ error: message });
  }

  if (err?.code === "23505") {
    return res.status(409).json({ error: "Ya existe un registro con esos datos unicos." });
  }

  if (err?.code === "22P02" || err?.code === "23514" || err?.code === "23503") {
    return res.status(400).json({ error: "Los datos o identificadores proporcionados no son validos." });
  }

  console.error("Error no controlado:", err);
  return res.status(500).json({ error: "Error interno del servidor" });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Ruta no encontrada" });
}
