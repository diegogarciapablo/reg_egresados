import { AppError } from "../../shared/errors/AppError.js";

export const RECOMMENDATION_STATUS = Object.freeze({
  PENDING: "pending",
  PUBLISHED: "published",
  REJECTED: "rejected",
});

export class Recommendation {
  constructor({ id, graduateId, authorName, authorRole = null, message, status = RECOMMENDATION_STATUS.PENDING }) {
    if (!authorName || !message) {
      throw new AppError("La recomendacion necesita nombre de autor y mensaje");
    }
    this.id = id;
    this.graduateId = graduateId;
    this.authorName = authorName;
    this.authorRole = authorRole;
    this.message = message;
    this.status = status;
  }
}
