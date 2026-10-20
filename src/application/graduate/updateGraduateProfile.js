import { ForbiddenError, NotFoundError } from "../../shared/errors/AppError.js";

export function makeUpdateGraduateProfile({ graduateRepository }) {
  return async function updateGraduateProfile({ userId, changes }) {
    const graduate = await graduateRepository.findByUserId(userId);
    if (!graduate) {
      throw new NotFoundError("El usuario no tiene una ficha asociada");
    }
    return graduateRepository.update(graduate.id, changes);
  };
}

export function makeUpdateVisibility({ graduateRepository }) {
  return async function updateVisibility({ userId, visibility }) {
    const graduate = await graduateRepository.findByUserId(userId);
    if (!graduate) {
      throw new NotFoundError("El usuario no tiene una ficha asociada");
    }
    return graduateRepository.update(graduate.id, { visibility });
  };
}

/**
 * Verifica que el graduateId pertenece al userId autenticado.
 * Se usa antes de dejar modificar proyectos, experiencias, etc.
 */
export async function assertOwnsGraduate({ graduateRepository, userId }) {
  const graduate = await graduateRepository.findByUserId(userId);
  if (!graduate) {
    throw new ForbiddenError("No tienes una ficha asociada");
  }
  return graduate;
}
