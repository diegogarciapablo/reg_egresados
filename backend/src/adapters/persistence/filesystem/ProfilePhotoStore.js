import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { PhotoStore } from "../../../domain/graduate/photoStore.js";
import { AppError } from "../../../shared/errors/AppError.js";

const storageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../multimedia",
);

const photoFormats = {
  jpg: { contentType: "image/jpeg" },
  png: { contentType: "image/png" },
  webp: { contentType: "image/webp" },
};

function detectPhotoFormat(file) {
  const { buffer, mimetype } = file;
  let extension;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) extension = "jpg";
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) extension = "png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") extension = "webp";

  if (!extension || photoFormats[extension].contentType !== mimetype) {
    throw new AppError("El archivo no es una imagen JPEG, PNG o WebP valida.");
  }

  return extension;
}

function isStoredPhoto(filename) {
  return /^photo-[0-9a-f-]+\.(jpg|png|webp)$/i.test(filename);
}

export function resolveGraduateFolder(graduateOrId) {
  const id = typeof graduateOrId === "object" && graduateOrId !== null ? graduateOrId.id : graduateOrId;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || ""))) {
    throw new AppError("Identificador de egresado invalido.");
  }

  if (typeof graduateOrId === "object" && graduateOrId !== null) {
    const rawName = `${graduateOrId.firstName || ""} ${graduateOrId.lastName || ""}`
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (rawName) {
      return { id, folderName: rawName };
    }
  }

  return { id, folderName: id };
}

export class ProfilePhotoStore extends PhotoStore {
  async save(graduateOrId, file) {
    const { id, folderName } = resolveGraduateFolder(graduateOrId);
    const extension = detectPhotoFormat(file);
    const profileDirectory = path.join(storageRoot, folderName);
    const filename = `photo-${randomUUID()}.${extension}`;
    await mkdir(profileDirectory, { recursive: true });
    await writeFile(path.join(profileDirectory, filename), file.buffer, { flag: "wx" });

    const oldFiles = (await readdir(profileDirectory)).filter(
      (entry) => entry !== filename && isStoredPhoto(entry),
    );
    await Promise.all(oldFiles.map((entry) => rm(path.join(profileDirectory, entry), { force: true })));

    return {
      url: `/api/graduates/photo/${id}`,
      contentType: photoFormats[extension].contentType,
    };
  }

  async read(graduateOrId) {
    const { id, folderName } = resolveGraduateFolder(graduateOrId);
    const candidateDirs = [path.join(storageRoot, folderName)];
    if (folderName !== id) candidateDirs.push(path.join(storageRoot, id));

    for (const dir of candidateDirs) {
      let entries;
      try {
        entries = await readdir(dir);
      } catch (error) {
        if (error.code === "ENOENT") continue;
        throw error;
      }

      const filename = entries.find(isStoredPhoto);
      if (filename) {
        const extension = path.extname(filename).slice(1).toLowerCase();
        return {
          buffer: await readFile(path.join(dir, filename)),
          contentType: photoFormats[extension].contentType,
        };
      }
    }

    return null;
  }

  async remove(graduateOrId) {
    const { id, folderName } = resolveGraduateFolder(graduateOrId);
    const candidateDirs = [path.join(storageRoot, folderName)];
    if (folderName !== id) candidateDirs.push(path.join(storageRoot, id));

    for (const dir of candidateDirs) {
      const entries = await readdir(dir).catch((error) => {
        if (error.code === "ENOENT") return [];
        throw error;
      });
      await Promise.all(
        entries
          .filter(isStoredPhoto)
          .map((entry) => rm(path.join(dir, entry), { force: true })),
      );
    }
  }
}
