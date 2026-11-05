import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { CertificateStore } from "../../../domain/graduate/certificateStore.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { resolveGraduateFolder } from "./ProfilePhotoStore.js";

const storageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../multimedia",
);

const certificateFormats = {
  pdf: { contentType: "application/pdf" },
  jpg: { contentType: "image/jpeg" },
  png: { contentType: "image/png" },
  webp: { contentType: "image/webp" },
};

function detectCertificateFormat(file) {
  const { buffer, mimetype } = file;
  let extension;

  if (buffer.subarray(0, 5).equals(Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]))) extension = "pdf";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) extension = "jpg";
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) extension = "png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") extension = "webp";

  if (!extension || certificateFormats[extension].contentType !== mimetype) {
    throw new AppError("El certificado digital debe ser un archivo PDF, JPEG, PNG o WebP valido.");
  }

  return extension;
}

function isStoredCertificate(filename) {
  return /^cert-[0-9a-f-]+\.(pdf|jpg|png|webp)$/i.test(filename);
}

export class CertificateFileStore extends CertificateStore {
  async save(graduateOrId, file) {
    const { id, folderName } = resolveGraduateFolder(graduateOrId);
    const extension = detectCertificateFormat(file);
    const userDirectory = path.join(storageRoot, folderName);
    const filename = `cert-${randomUUID()}.${extension}`;
    await mkdir(userDirectory, { recursive: true });
    await writeFile(path.join(userDirectory, filename), file.buffer, { flag: "wx" });

    const safeOriginalName = path
      .basename(file.originalname || `certificado.${extension}`)
      .replace(/[^\w.\- ()áéíóúÁÉÍÓÚñÑ]/g, "_")
      .slice(0, 200);

    return {
      url: `/api/graduates/certificates/${id}/${filename}`,
      fileName: safeOriginalName,
      contentType: certificateFormats[extension].contentType,
    };
  }

  async read(graduateOrId, filename) {
    const { id, folderName } = resolveGraduateFolder(graduateOrId);
    if (!isStoredCertificate(filename)) return null;

    const candidatePaths = [
      path.join(storageRoot, folderName, filename),
      path.join(storageRoot, folderName, "certificates", filename),
      path.join(storageRoot, id, filename),
      path.join(storageRoot, id, "certificates", filename),
    ];

    for (const filePath of candidatePaths) {
      try {
        const buffer = await readFile(filePath);
        const extension = path.extname(filename).slice(1).toLowerCase();
        return {
          buffer,
          contentType: certificateFormats[extension].contentType,
        };
      } catch (error) {
        if (error.code === "ENOENT") continue;
        throw error;
      }
    }

    // Fallback en caso de que el usuario haya cambiado su nombre despues de subir el documento
    try {
      const subdirs = await readdir(storageRoot, { withFileTypes: true });
      for (const entry of subdirs) {
        if (!entry.isDirectory()) continue;
        for (const candidate of [
          path.join(storageRoot, entry.name, filename),
          path.join(storageRoot, entry.name, "certificates", filename),
        ]) {
          try {
            const buffer = await readFile(candidate);
            const extension = path.extname(filename).slice(1).toLowerCase();
            return {
              buffer,
              contentType: certificateFormats[extension].contentType,
            };
          } catch (err) {
            if (err.code !== "ENOENT") throw err;
          }
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    return null;
  }
}
