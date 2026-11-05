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
    return graduateRepository.setCertificates(graduate.id, certificates);
  };
}

export function makeUploadCertificateFile({ graduateRepository, certificateFileStore }) {
  return async function uploadCertificateFile({ userId, file }) {
    if (!file) throw new AppError("Selecciona un archivo de certificado (PDF o imagen).");
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    const saved = await certificateFileStore.save(graduate.id, file);
    return {
      fileUrl: saved.url,
      fileName: saved.fileName,
    };
  };
}

export function makeGetCertificateFile({ graduateRepository, certificateFileStore }) {
  return async function getCertificateFile({ userId, graduateId, filename }) {
    const graduate = await graduateRepository.findById(graduateId);
    if (!graduate) throw new NotFoundError("Certificado no encontrado");

    const isOwner = Boolean(userId && graduate.userId === userId);
    if (!isOwner && graduate.visibility === "private") {
      throw new NotFoundError("Certificado no encontrado");
    }

    const file = await certificateFileStore.read(graduateId, filename);
    if (!file) throw new NotFoundError("Certificado no encontrado");
    return file;
  };
}
