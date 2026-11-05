import bcrypt from "bcrypt";
import { UnauthorizedError } from "../../shared/errors/AppError.js";

export function makeLoginUser({ userRepository }) {
  return async function loginUser({ email, password }) {
    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Credenciales invalidas");
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedError("Credenciales invalidas");
    }

    await userRepository.updateLastLogin(user.id);

    return user.toSafeObject ? user.toSafeObject() : user;
  };
}
