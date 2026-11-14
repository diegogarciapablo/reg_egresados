import { NotFoundError } from "../../shared/errors/AppError.js";

export function makeGetPublicProfile({ graduateRepository, userRepository }) {
  return async function getPublicProfile(registrationCode, currentUserId = null) {
    const graduate = await graduateRepository.findByRegistrationCode(registrationCode);
    if (!graduate) {
      throw new NotFoundError("Ficha no encontrada");
    }

    // Si la ficha es privada, solo pueden verla su propio dueño o un administrador
    if (graduate.visibility === "private") {
      let isOwnerOrAdmin = false;
      if (currentUserId) {
        if (graduate.userId === currentUserId) {
          isOwnerOrAdmin = true;
        } else if (userRepository) {
          const user = await userRepository.findById(currentUserId);
          if (user && user.isAdmin()) isOwnerOrAdmin = true;
        }
      }

      if (!isOwnerOrAdmin) {
        throw new NotFoundError("Ficha no encontrada");
      }
    }

    const details = await graduateRepository.getFullProfile(graduate.id);
    return { ...graduate, ...details };
  };
}
