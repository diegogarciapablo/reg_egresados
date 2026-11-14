import { ForbiddenError, NotFoundError } from "../../shared/errors/AppError.js";

export function makeGetMyProfile({ graduateRepository }) {
  return async function getMyProfile({ userId }) {
    const graduate = await graduateRepository.findByUserId(userId);
    if (!graduate) {
      throw new NotFoundError("No tienes ficha asociada");
    }
    const details = await graduateRepository.getFullProfile(graduate.id);
    return { ...graduate, ...details };
  };
}

export function makeUpdateGraduateProfile({ graduateRepository, userRepository, auditLogRepository }) {
  return async function updateGraduateProfile({ userId, changes }) {
    const graduate = await graduateRepository.findByUserId(userId);
    if (!graduate) {
      throw new NotFoundError("El usuario no tiene una ficha asociada");
    }

    const { technologyIds, softSkillIds, ...profileChanges } = changes || {};
    const beforeState = {};
    for (const key of Object.keys(profileChanges)) {
      beforeState[key] = graduate[key];
    }

    const updated = await graduateRepository.update(graduate.id, profileChanges, true);
    if (Array.isArray(technologyIds)) {
      await graduateRepository.setTechnologies(graduate.id, technologyIds);
    }
    if (Array.isArray(softSkillIds)) {
      await graduateRepository.setSoftSkills(graduate.id, softSkillIds);
    }

    if (auditLogRepository) {
      const user = await userRepository?.findById(userId);
      await auditLogRepository.create({
        userId,
        userEmail: user?.email,
        userRole: user?.role || "graduate",
        entityType: "graduate_profile",
        entityId: graduate.id,
        action: "actualizar_datos_personales",
        details: `Actualizó información de su ficha (${Object.keys(profileChanges).join(", ")})`,
        beforeState,
        afterState: profileChanges,
      }).catch(console.error);
    }

    return updated;
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
