export const ROLE = Object.freeze({
  GRADUATE: "graduate",
  ADMIN: "admin",
});

export class User {
  constructor({ id, email, passwordHash, role = ROLE.GRADUATE, isActive = true }) {
    if (!email || !email.includes("@")) {
      throw new Error("Email invalido");
    }
    this.id = id;
    this.email = email.toLowerCase();
    this.passwordHash = passwordHash;
    this.role = role;
    this.isActive = isActive;
  }

  isAdmin() {
    return this.role === ROLE.ADMIN;
  }

  toSafeObject() {
    // Nunca exponer el password_hash fuera del dominio.
    return { id: this.id, email: this.email, role: this.role, isActive: this.isActive };
  }
}
