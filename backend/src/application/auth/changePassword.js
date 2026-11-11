import bcrypt from "bcrypt";
import { AppError, UnauthorizedError, NotFoundError } from "../../shared/errors/AppError.js";

const SALT_ROUNDS = 12;

export function makeChangePassword({ userRepository }) {
  return async function changePassword({ userId, currentPassword, newPassword }) {
    if (!userId) throw new UnauthorizedError("Debes iniciar sesión");

    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("Usuario no encontrado");

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      throw new AppError("La contraseña actual es incorrecta", 400);
    }

    if (currentPassword === newPassword) {
      throw new AppError("La nueva contraseña no puede ser idéntica a la anterior", 400);
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(user.id, newHash);

    return { message: "Contraseña actualizada correctamente" };
  };
}
