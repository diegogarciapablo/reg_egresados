import { AppError } from "../../shared/errors/AppError.js";

export const ROLE = Object.freeze({
  GRADUATE: "graduate",
  ADMIN: "admin",
});

export class User {
  constructor({ id, email, passwordHash, role = ROLE.GRADUATE, isActive = true, emailVerified = false, termsAcceptedAt = null }) {
    if (!email || !email.includes("@")) {
      throw new AppError("Email invalido");
    }
    this.id = id;
    this.email = email.toLowerCase();
    this.passwordHash = passwordHash;
    this.role = role;
    this.isActive = isActive;
    this.emailVerified = Boolean(emailVerified);
    this.termsAcceptedAt = termsAcceptedAt;
  }

  isAdmin() {
    return this.role === ROLE.ADMIN;
  }

  hasAcceptedTerms() {
    return Boolean(this.termsAcceptedAt);
  }

  toSafeObject() {
    // Nunca exponer el password_hash fuera del dominio.
    // El rol solo es visible cuando el usuario es administrador.
    return {
      id: this.id,
      email: this.email,
      isActive: this.isActive,
      emailVerified: this.emailVerified,
      termsAccepted: this.hasAcceptedTerms(),
      termsAcceptedAt: this.termsAcceptedAt,
      ...(this.isAdmin() ? { role: this.role } : {}),
    };
  }
}
