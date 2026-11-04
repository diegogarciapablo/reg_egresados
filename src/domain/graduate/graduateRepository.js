/**
 * Puerto de salida (interfaz) que debe implementar cualquier adaptador
 * de persistencia para egresados. La capa de aplicacion depende de esto,
 * nunca de una implementacion concreta (Postgres, memoria, etc).
 *
 * Esta clase no se instancia; documenta el contrato esperado.
 */
export class GraduateRepository {
  async findById(_id) {
    throw new Error("No implementado");
  }

  async findByUserId(_userId) {
    throw new Error("No implementado");
  }

  async findByRegistrationCode(_code) {
    throw new Error("No implementado");
  }

  async searchDirectory(_filters) {
    throw new Error("No implementado");
  }

  async create(_graduateData) {
    throw new Error("No implementado");
  }

  async update(_id, _changes) {
    throw new Error("No implementado");
  }

  async setTechnologies(_graduateId, _technologyIds) {
    throw new Error("No implementado");
  }

  async setSoftSkills(_graduateId, _softSkillIds) {
    throw new Error("No implementado");
  }

  async setProjects(_graduateId, _projects) {
    throw new Error("No implementado");
  }

  async setExperiences(_graduateId, _experiences) {
    throw new Error("No implementado");
  }

  async getFullProfile(_graduateId) {
    throw new Error("No implementado");
  }
}
