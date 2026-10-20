export const COVER_LETTER_STATUS = Object.freeze({
  DRAFT: "draft",
  ARCHIVED: "archived",
});

export const MAX_SELECTIONS_TOTAL = 5;
export const MAX_SELECTIONS_PER_CATEGORY = 2;

/**
 * Valida que la combinacion de tecnologias + habilidades blandas elegidas
 * para una carta respete las reglas de negocio: maximo 5 en total y
 * maximo 2 por categoria (tecnologias y habilidades blandas por separado).
 */
export function assertSelectionLimits({ technologyIds = [], softSkillIds = [] }) {
  if (technologyIds.length > MAX_SELECTIONS_PER_CATEGORY) {
    throw new Error(`Maximo ${MAX_SELECTIONS_PER_CATEGORY} tecnologias por carta`);
  }
  if (softSkillIds.length > MAX_SELECTIONS_PER_CATEGORY) {
    throw new Error(`Maximo ${MAX_SELECTIONS_PER_CATEGORY} habilidades blandas por carta`);
  }
  if (technologyIds.length + softSkillIds.length > MAX_SELECTIONS_TOTAL) {
    throw new Error(`Maximo ${MAX_SELECTIONS_TOTAL} selecciones en total por carta`);
  }
}

export class CoverLetter {
  constructor({
    id,
    graduateId,
    fullName,
    companyName,
    targetPosition,
    status = COVER_LETTER_STATUS.DRAFT,
    ...rest
  }) {
    if (!fullName || !companyName || !targetPosition) {
      throw new Error("La carta necesita nombre, empresa y puesto objetivo");
    }
    this.id = id;
    this.graduateId = graduateId;
    this.fullName = fullName;
    this.companyName = companyName;
    this.targetPosition = targetPosition;
    this.status = status;
    Object.assign(this, rest);
  }
}
