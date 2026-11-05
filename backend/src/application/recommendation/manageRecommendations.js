import { NotFoundError } from "../../shared/errors/AppError.js";

export function makeCreateRecommendation({ recommendationRepository, graduateRepository }) {
  return async function createRecommendation({ graduateId, authorName, authorRole, message }) {
    const graduate = await graduateRepository.findById(graduateId);
    if (!graduate) {
      throw new NotFoundError("Egresado no encontrado");
    }
    return recommendationRepository.create({
      graduateId,
      authorName,
      authorRole,
      message,
      status: "pending",
    });
  };
}

export function makeModerateRecommendation({ recommendationRepository }) {
  return async function moderateRecommendation({ id, status }) {
    return recommendationRepository.updateStatus(id, status);
  };
}
