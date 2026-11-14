import { AppError, NotFoundError } from "../../shared/errors/AppError.js";
import { assertOwnsGraduate } from "./updateGraduateProfile.js";

export function makeUpdateGraduateTechnologies({ graduateRepository, userRepository, auditLogRepository }) {
  return async function updateGraduateTechnologies({ userId, technologyIds }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    const oldTechs = (await graduateRepository.getFullProfile(graduate.id))?.technologies || [];
    const result = await graduateRepository.setTechnologies(graduate.id, technologyIds);

    if (auditLogRepository) {
      const user = await userRepository?.findById(userId);
      await auditLogRepository.create({
        userId,
        userEmail: user?.email,
        userRole: user?.role || "graduate",
        entityType: "graduate_technologies",
        entityId: graduate.id,
        action: "actualizar_habilidades_tecnicas",
        details: `Actualizó habilidades técnicas: ${technologyIds.length} seleccionadas.`,
        beforeState: { technologyIds: oldTechs.map((t) => t.id), technologyNames: oldTechs.map((t) => t.name) },
        afterState: { technologyIds },
      }).catch(console.error);
    }
    return result;
  };
}

export function makeUpdateGraduateSoftSkills({ graduateRepository, userRepository, auditLogRepository }) {
  return async function updateGraduateSoftSkills({ userId, softSkillIds }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    const oldSkills = (await graduateRepository.getFullProfile(graduate.id))?.softSkills || [];
    const result = await graduateRepository.setSoftSkills(graduate.id, softSkillIds);

    if (auditLogRepository) {
      const user = await userRepository?.findById(userId);
      await auditLogRepository.create({
        userId,
        userEmail: user?.email,
        userRole: user?.role || "graduate",
        entityType: "graduate_soft_skills",
        entityId: graduate.id,
        action: "actualizar_habilidades_personales",
        details: `Actualizó habilidades personales: ${softSkillIds.length} seleccionadas.`,
        beforeState: { softSkillIds: oldSkills.map((s) => s.id), softSkillNames: oldSkills.map((s) => s.name) },
        afterState: { softSkillIds },
      }).catch(console.error);
    }
    return result;
  };
}

export function makeUpdateGraduateLanguages({ graduateRepository, userRepository, auditLogRepository }) {
  return async function updateGraduateLanguages({ userId, languages }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    const oldLangs = (await graduateRepository.getFullProfile(graduate.id))?.languages || [];
    const result = await graduateRepository.setLanguages(graduate.id, languages);

    if (auditLogRepository) {
      const user = await userRepository?.findById(userId);
      await auditLogRepository.create({
        userId,
        userEmail: user?.email,
        userRole: user?.role || "graduate",
        entityType: "graduate_languages",
        entityId: graduate.id,
        action: "actualizar_idiomas",
        details: `Actualizó idiomas registrados (${languages.length} idiomas).`,
        beforeState: { languages: oldLangs },
        afterState: { languages },
      }).catch(console.error);
    }
    return result;
  };
}

export function makeUpdateGraduateProjects({ graduateRepository, userRepository, auditLogRepository }) {
  return async function updateGraduateProjects({ userId, projects }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    const oldProjects = (await graduateRepository.getFullProfile(graduate.id))?.projects || [];
    const result = await graduateRepository.setProjects(graduate.id, projects);

    if (auditLogRepository) {
      const user = await userRepository?.findById(userId);
      await auditLogRepository.create({
        userId,
        userEmail: user?.email,
        userRole: user?.role || "graduate",
        entityType: "graduate_projects",
        entityId: graduate.id,
        action: "actualizar_proyectos",
        details: `Guardó proyectos realizados (${projects.length} proyectos).`,
        beforeState: { count: oldProjects.length, titles: oldProjects.map((p) => p.title) },
        afterState: { count: projects.length, titles: projects.map((p) => p.title) },
      }).catch(console.error);
    }
    return result;
  };
}

export function makeUpdateGraduateExperiences({ graduateRepository, userRepository, auditLogRepository }) {
  return async function updateGraduateExperiences({ userId, experiences }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    const oldExperiences = (await graduateRepository.getFullProfile(graduate.id))?.experiences || [];
    const result = await graduateRepository.setExperiences(graduate.id, experiences);

    if (auditLogRepository) {
      const user = await userRepository?.findById(userId);
      await auditLogRepository.create({
        userId,
        userEmail: user?.email,
        userRole: user?.role || "graduate",
        entityType: "graduate_experiences",
        entityId: graduate.id,
        action: "actualizar_experiencias",
        details: `Guardó experiencias laborales y académicas (${experiences.length} registros).`,
        beforeState: { count: oldExperiences.length, items: oldExperiences.map((e) => `${e.position} en ${e.organization}`) },
        afterState: { count: experiences.length, items: experiences.map((e) => `${e.position} en ${e.organization}`) },
      }).catch(console.error);
    }
    return result;
  };
}

export function makeUpdateGraduateCertificates({ graduateRepository, userRepository, auditLogRepository }) {
  return async function updateGraduateCertificates({ userId, certificates }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    const oldCerts = (await graduateRepository.getFullProfile(graduate.id))?.certificates || [];
    const ownedPrefix = `/api/graduates/certificates/${graduate.id}/`;
    for (const cert of certificates) {
      if (cert.fileUrl && cert.fileUrl.startsWith("/api/") && !cert.fileUrl.startsWith(ownedPrefix)) {
        throw new AppError("No puedes asociar un archivo digital que pertenece a otro perfil.");
      }
    }
    const result = await graduateRepository.setCertificates(graduate.id, certificates);

    if (auditLogRepository) {
      const user = await userRepository?.findById(userId);
      await auditLogRepository.create({
        userId,
        userEmail: user?.email,
        userRole: user?.role || "graduate",
        entityType: "graduate_certificates",
        entityId: graduate.id,
        action: "actualizar_formacion_academica",
        details: `Guardó formación académica y certificados (${certificates.length} registros).`,
        beforeState: { count: oldCerts.length, titles: oldCerts.map((c) => c.title) },
        afterState: { count: certificates.length, titles: certificates.map((c) => c.title) },
      }).catch(console.error);
    }
    return result;
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
