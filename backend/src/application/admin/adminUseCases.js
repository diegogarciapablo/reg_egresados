import {
  getEntityDefinitions,
  normalizeEntityCreate,
  normalizeEntityChanges,
} from "../../domain/admin/adminEntitySchemas.js";
import { AppError, ConflictError } from "../../shared/errors/AppError.js";

export function makeListAllGraduates({ graduateRepository }) {
  return async function listAllGraduates({ page, limit }) {
    return graduateRepository.searchDirectory({ page, limit, visibility: undefined, includeInactive: true });
  };
}

export function makeUpdateGraduateStatus({ graduateRepository }) {
  return async function updateGraduateStatus({ graduateId, visibility }) {
    return graduateRepository.update(graduateId, { visibility });
  };
}

export function makeListAdminEntityDefinitions() {
  return function listAdminEntityDefinitions() {
    return getEntityDefinitions();
  };
}

export function makeListAdminEntityRows({ adminEntityRepository }) {
  return async function listAdminEntityRows({ entity, search = "" }) {
    return adminEntityRepository.list(entity, search);
  };
}

export function makeCreateAdminEntity({ adminEntityRepository }) {
  return async function createAdminEntity({ entity, data }) {
    const normalized = normalizeEntityCreate(entity, data);
    return adminEntityRepository.create(entity, normalized);
  };
}

export function makeUpdateAdminEntity({ adminEntityRepository }) {
  return async function updateAdminEntity({ entity, id, changes, actorId }) {
    const normalized = normalizeEntityChanges(entity, changes);

    if (entity === "users" && changes && changes.role && changes.role !== "admin") {
      if (actorId && id === actorId) {
        throw new ConflictError("No puedes quitarte el rol de administrador a ti mismo.");
      }
      const otherAdmins = await adminEntityRepository.countOtherActiveAdmins(id);
      if (otherAdmins === 0) {
        throw new ConflictError("Debe permanecer al menos un administrador activo.");
      }
    }

    return adminEntityRepository.update(entity, id, normalized);
  };
}

export function makeSetAdminEntityActive({ adminEntityRepository }) {
  return async function setAdminEntityActive({ entity, id, isActive, actorId }) {
    if (typeof isActive !== "boolean") {
      throw new AppError("El estado debe ser verdadero o falso.");
    }

    if (entity === "users" && !isActive) {
      if (id === actorId) {
        throw new ConflictError("No puedes deshabilitar tu propia cuenta.");
      }
      const otherAdmins = await adminEntityRepository.countOtherActiveAdmins(id);
      if (otherAdmins === 0) {
        throw new ConflictError("Debe permanecer al menos un administrador activo.");
      }
    }

    return adminEntityRepository.setActive(entity, id, isActive);
  };
}
