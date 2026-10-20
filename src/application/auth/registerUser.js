import bcrypt from "bcrypt";
import { ConflictError } from "../../shared/errors/AppError.js";

const SALT_ROUNDS = 12;

/**
 * Caso de uso: registrar una nueva cuenta de egresado.
 * Crea el usuario y su ficha (graduate) en una sola transaccion.
 *
 * @param {object} deps - { userRepository, graduateRepository, withTransaction }
 */
export function makeRegisterUser({ userRepository, graduateRepository, withTransaction }) {
  return async function registerUser({ email, password, firstName, lastName, graduationYear }) {
    const normalizedEmail = email.toLowerCase();

    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError("Ya existe una cuenta con ese correo");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const registrationCode = buildRegistrationCode(graduationYear);

    return withTransaction(async (client) => {
      const user = await userRepository.create(
        { email: normalizedEmail, passwordHash, role: "graduate" },
        client
      );
      const graduate = await graduateRepository.create(
        {
          userId: user.id,
          registrationCode,
          firstName,
          lastName,
          graduationYear,
          visibility: "private",
        },
        client
      );
      return { user: user.toSafeObject ? user.toSafeObject() : user, graduate };
    });
  };
}

function buildRegistrationCode(graduationYear) {
  const random = Math.floor(Math.random() * 900 + 100); // 3 digitos
  return `EGR-${graduationYear}-${random}`;
}
