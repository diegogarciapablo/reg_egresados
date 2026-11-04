import { NotFoundError } from "../../shared/errors/AppError.js";

export function makeGetPublicProfile({ graduateRepository }) {
  return async function getPublicProfile(registrationCode) {
    const graduate = await graduateRepository.findByRegistrationCode(registrationCode);
    if (!graduate || graduate.visibility === "private") {
      throw new NotFoundError("Ficha no encontrada");
    }
    const details = await graduateRepository.getFullProfile(graduate.id);
    return { ...graduate, ...details };
  };
}
