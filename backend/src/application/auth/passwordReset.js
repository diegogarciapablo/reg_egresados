import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { AppError } from "../../shared/errors/AppError.js";
import { env } from "../../config/env.js";

export function makeRequestPasswordReset({ userRepository, graduateRepository, emailService }) {
  return async function requestPasswordReset({ email }) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const user = await userRepository.findByEmail(cleanEmail);

    if (!user || !user.isActive) {
      return {
        success: true,
        message: "Si el correo electrónico se encuentra registrado, recibirás un enlace para restablecer tu contraseña.",
      };
    }

    const graduate = graduateRepository ? await graduateRepository.findByUserId(user.id) : null;
    const recipientName = graduate ? `${graduate.firstName} ${graduate.lastName}` : "Usuario";

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas de validez

    await userRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);

    const resetUrl = `${env.frontendUrl}/restablecer-password.html?token=${rawToken}`;

    await emailService.sendPasswordResetEmail({
      to: user.email,
      name: recipientName,
      resetUrl,
    });

    return {
      success: true,
      message: "Se ha enviado un enlace de recuperación a tu correo electrónico.",
    };
  };
}

export function makeResetPassword({ userRepository }) {
  return async function resetPassword({ token, newPassword }) {
    if (!token || typeof token !== "string") {
      throw new AppError("Token de recuperación inválido o ausente.", 400);
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await userRepository.findPasswordResetToken(tokenHash);

    if (!tokenRecord || !tokenRecord.is_active) {
      throw new AppError("El enlace de recuperación no es válido o ya ha expirado.", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(tokenRecord.user_id, passwordHash);
    await userRepository.deletePasswordResetTokens(tokenRecord.user_id);

    return {
      success: true,
      message: "¡Tu contraseña ha sido restablecida con éxito! Ya puedes iniciar sesión.",
    };
  };
}
