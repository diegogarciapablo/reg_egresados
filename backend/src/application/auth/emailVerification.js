import crypto from "node:crypto";
import { AppError } from "../../shared/errors/AppError.js";
import { env } from "../../config/env.js";

export function makeRequestEmailVerification({ userRepository, graduateRepository, emailService }) {
  return async function requestEmailVerification(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    if (user.emailVerified) {
      return { alreadyVerified: true, message: "Tu correo electrónico ya se encuentra verificado." };
    }

    const graduate = await graduateRepository.findByUserId(userId);
    const recipientName = graduate ? `${graduate.firstName} ${graduate.lastName}` : "Egresado";

    // Generar token criptográfico seguro
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    await userRepository.createVerificationToken(userId, tokenHash, expiresAt);

    const verificationUrl = `${env.frontendUrl}/verificar-correo.html?token=${rawToken}`;

    await emailService.sendVerificationEmail({
      to: user.email,
      name: recipientName,
      verificationUrl,
    });

    return {
      success: true,
      message: "Se ha enviado un enlace de verificación a tu correo electrónico.",
      email: user.email,
    };
  };
}

export function makeVerifyEmail({ userRepository }) {
  return async function verifyEmail(rawToken) {
    if (!rawToken || typeof rawToken !== "string") {
      throw new AppError("Token de verificación inválido o ausente", 400);
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const tokenRecord = await userRepository.findVerificationToken(tokenHash);

    if (!tokenRecord) {
      throw new AppError("El enlace de verificación no es válido o ya ha expirado.", 400);
    }

    await userRepository.setEmailVerified(tokenRecord.user_id);

    return {
      success: true,
      message: "¡Correo electrónico verificado con éxito!",
      email: tokenRecord.email,
    };
  };
}
