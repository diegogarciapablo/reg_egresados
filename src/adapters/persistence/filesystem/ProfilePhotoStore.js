import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { AppError } from "../../../shared/errors/AppError.js";

const storageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../multimedia",
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

export class ProfilePhotoStore {
  async save(graduateId, file) {
    const extension = detectPhotoFormat(file);
    const profileDirectory = path.join(storageRoot, graduateId);
    const filename = `photo-${randomUUID()}.${extension}`;
    await mkdir(profileDirectory, { recursive: true });
    await writeFile(path.join(profileDirectory, filename), file.buffer, { flag: "wx" });

    const oldFiles = (await readdir(profileDirectory)).filter(
      (entry) => entry !== filename && isStoredPhoto(entry),
    );
    await Promise.all(oldFiles.map((entry) => rm(path.join(profileDirectory, entry), { force: true })));

    return {
      url: `/api/me/profile/photo/${graduateId}`,
      contentType: photoFormats[extension].contentType,
    };
  }

  async read(graduateId) {
    const profileDirectory = path.join(storageRoot, graduateId);
    let entries;
    try {
      entries = await readdir(profileDirectory);
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }

    const filename = entries.find(isStoredPhoto);
    if (!filename) return null;

    const extension = path.extname(filename).slice(1).toLowerCase();
    return {
      buffer: await readFile(path.join(profileDirectory, filename)),
      contentType: photoFormats[extension].contentType,
    };
  }

  async remove(graduateId) {
    const profileDirectory = path.join(storageRoot, graduateId);
    const entries = await readdir(profileDirectory).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    await Promise.all(
      entries
        .filter(isStoredPhoto)
        .map((entry) => rm(path.join(profileDirectory, entry), { force: true })),
    );
    await rm(profileDirectory, { recursive: true, force: true });
  }
}