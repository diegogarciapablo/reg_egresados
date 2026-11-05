import { AppError, NotFoundError } from "../../shared/errors/AppError.js";
import { assertOwnsGraduate } from "./updateGraduateProfile.js";

export function makeUpdateGraduateTechnologies({ graduateRepository }) {
  return async function updateGraduateTechnologies({ userId, technologyIds }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    return graduateRepository.setTechnologies(graduate.id, technologyIds);
  };
}

export function makeUpdateGraduateSoftSkills({ graduateRepository }) {
  return async function updateGraduateSoftSkills({ userId, softSkillIds }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    return graduateRepository.setSoftSkills(graduate.id, softSkillIds);
  };
}

export function makeUpdateGraduateProjects({ graduateRepository }) {
  return async function updateGraduateProjects({ userId, projects }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    return graduateRepository.setProjects(graduate.id, projects);
  };
}

export function makeUpdateGraduateExperiences({ graduateRepository }) {
  return async function updateGraduateExperiences({ userId, experiences }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    return graduateRepository.setExperiences(graduate.id, experiences);
  };
}

export function makeUpdateGraduateCertificates({ graduateRepository }) {
  return async function updateGraduateCertificates({ userId, certificates }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    const ownedPrefix = `/api/graduates/certificates/${graduate.id}/`;
    for (const cert of certificates) {
      if (cert.fileUrl && cert.fileUrl.startsWith("/api/") && !cert.fileUrl.startsWith(ownedPrefix)) {
        throw new AppError("No puedes asociar un archivo digital que pertenece a otro perfil.");
      }
    }
    return graduateRepository.setCertificates(graduate.id, certificates);
  };
}

export function makeUploadCertificateFile({ graduateRepository, certificateFileStore }) {
  return async function uploadCertificateFile({ userId, file }) {
    if (!file) throw new AppError("Selecciona un archivo de certificado (PDF o imagen).");
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    const saved = await certificateFileStore.save(graduate, file);
    return {
      fileUrl: saved.url,
      fileName: saved.fileName,
    };
  };
}

export function makeGetCertificateFile({ graduateRepository, certificateFileStore }) {
  return async function getCertificateFile({ userId, userRole, graduateId, filename }) {
    const graduate = await graduateRepository.findById(graduateId);
    if (!graduate) throw new NotFoundError("Certificado no encontrado");

    const isOwner = Boolean(userId && graduate.userId === userId);
    const isAdmin = userRole === "admin";
    if (!isOwner && !isAdmin && graduate.visibility === "private") {
      throw new NotFoundError("Certificado no encontrado");
    }

    const file = await certificateFileStore.read(graduate, filename);
    if (!file) throw new NotFoundError("Certificado no encontrado");
    return file;
  };
}
