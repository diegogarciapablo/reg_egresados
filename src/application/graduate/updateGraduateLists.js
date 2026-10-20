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
