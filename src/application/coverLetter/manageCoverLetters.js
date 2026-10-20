import { NotFoundError, ForbiddenError } from "../../shared/errors/AppError.js";
import { assertSelectionLimits } from "../../domain/coverLetter/CoverLetter.js";
import { assertOwnsGraduate } from "../graduate/updateGraduateProfile.js";

export function makeCreateCoverLetter({ coverLetterRepository, graduateRepository }) {
  return async function createCoverLetter({ userId, data }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    return coverLetterRepository.create({ ...data, graduateId: graduate.id });
  };
}

export function makeListCoverLetters({ coverLetterRepository, graduateRepository }) {
  return async function listCoverLetters({ userId }) {
    const graduate = await assertOwnsGraduate({ graduateRepository, userId });
    return coverLetterRepository.listByGraduate(graduate.id);
  };
}

export function makeGetCoverLetter({ coverLetterRepository, graduateRepository }) {
  return function getCoverLetter({ userId, coverLetterId }) {
    return assertOwnsCoverLetter({ coverLetterRepository, graduateRepository, userId, coverLetterId });
  };
}

async function assertOwnsCoverLetter({ coverLetterRepository, graduateRepository, userId, coverLetterId }) {
  const graduate = await assertOwnsGraduate({ graduateRepository, userId });
  const coverLetter = await coverLetterRepository.findById(coverLetterId);
  if (!coverLetter) {
    throw new NotFoundError("Carta no encontrada");
  }
  if (coverLetter.graduateId !== graduate.id) {
    throw new ForbiddenError("Esta carta no te pertenece");
  }
  return coverLetter;
}

export function makeUpdateCoverLetter({ coverLetterRepository, graduateRepository }) {
  return async function updateCoverLetter({ userId, coverLetterId, changes }) {
    await assertOwnsCoverLetter({ coverLetterRepository, graduateRepository, userId, coverLetterId });
    return coverLetterRepository.update(coverLetterId, changes);
  };
}

export function makeSetCoverLetterSelections({ coverLetterRepository, graduateRepository }) {
  return async function setCoverLetterSelections({ userId, coverLetterId, technologyIds = [], softSkillIds = [] }) {
    await assertOwnsCoverLetter({ coverLetterRepository, graduateRepository, userId, coverLetterId });
    assertSelectionLimits({ technologyIds, softSkillIds });
    return coverLetterRepository.setSelections(coverLetterId, { technologyIds, softSkillIds });
  };
}
