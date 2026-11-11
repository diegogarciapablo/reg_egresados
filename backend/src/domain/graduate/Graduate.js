import { AppError } from "../../shared/errors/AppError.js";

export const VISIBILITY = Object.freeze({
  PUBLIC: "public",
  LINK_ONLY: "link_only",
  PRIVATE: "private",
});

/**
 * Entidad de dominio: representa la ficha profesional de un egresado.
 * No conoce Express, pg ni ningun detalle de infraestructura.
 */
export class Graduate {
  constructor({
    id,
    userId,
    registrationCode,
    firstName,
    lastName,
    currentRole = null,
    graduationYear,
    professionalSummary = null,
    photoUrl = null,
    phone = null,
    personalEmail = null,
    institutionalEmail = null,
    professionalLinks = [],
    githubUrl = null,
    linkedinUrl = null,
    portfolioUrl = null,
    visibility = VISIBILITY.PRIVATE,
  }) {
    if (!firstName || !lastName) {
      throw new AppError("El egresado debe tener nombre y apellido");
    }
    if (!graduationYear || graduationYear < 1950 || graduationYear > 2100) {
      throw new AppError("Año de egreso invalido");
    }

    this.id = id;
    this.userId = userId;
    this.registrationCode = registrationCode;
    this.firstName = firstName;
    this.lastName = lastName;
    this.currentRole = currentRole;
    this.graduationYear = graduationYear;
    this.professionalSummary = professionalSummary;
    this.photoUrl = photoUrl;
    this.phone = phone;
    this.personalEmail = personalEmail;
    this.institutionalEmail = institutionalEmail;
    this.professionalLinks = Array.isArray(professionalLinks) ? professionalLinks : [];
    this.githubUrl = githubUrl;
    this.linkedinUrl = linkedinUrl;
    this.portfolioUrl = portfolioUrl;
    this.visibility = visibility;
  }

  isPublic() {
    return this.visibility === VISIBILITY.PUBLIC;
  }

  fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
