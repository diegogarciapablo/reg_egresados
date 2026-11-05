import { AppError, NotFoundError } from "../../shared/errors/AppError.js";

export function makeUploadProfilePhoto({ graduateRepository, profilePhotoStore }) {
  return async function uploadProfilePhoto({ userId, file }) {
    if (!file) throw new AppError("Selecciona una foto para subir.");
    const graduate = await graduateRepository.findByUserId(userId);
    if (!graduate) throw new NotFoundError("No tienes ficha asociada");

    const photo = await profilePhotoStore.save(graduate, file);
    const updated = await graduateRepository.update(graduate.id, { photoUrl: photo.url });
    return { photoUrl: updated.photoUrl };
  };
}

export function makeGetProfilePhoto({ graduateRepository, profilePhotoStore }) {
  return async function getProfilePhoto({ userId, userRole, graduateId }) {
    const graduate = await graduateRepository.findById(graduateId);
    if (!graduate) {
      throw new NotFoundError("Foto no encontrada");
    }

    const isOwner = Boolean(userId && graduate.userId === userId);
    const isAdmin = userRole === "admin";
    if (!isOwner && !isAdmin && graduate.visibility === "private") {
      throw new NotFoundError("Foto no encontrada");
    }

    if (
      graduate.photoUrl !== `/api/me/profile/photo/${graduate.id}` &&
      graduate.photoUrl !== `/api/graduates/photo/${graduate.id}`
    ) {
      throw new NotFoundError("Foto no encontrada");
    }

    const photo = await profilePhotoStore.read(graduate);
    if (!photo) throw new NotFoundError("Foto no encontrada");
    return photo;
  };
}

export function makeDeleteProfilePhoto({ graduateRepository, profilePhotoStore }) {
  return async function deleteProfilePhoto({ userId }) {
    const graduate = await graduateRepository.findByUserId(userId);
    if (!graduate) throw new NotFoundError("No tienes ficha asociada");
    await graduateRepository.update(graduate.id, { photoUrl: null });
    await profilePhotoStore.remove(graduate);
    return { photoUrl: null };
  };
}
