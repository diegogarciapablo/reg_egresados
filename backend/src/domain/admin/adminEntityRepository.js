/**
 * Puerto de salida para la administracion dinamica de entidades.
 */
export class AdminEntityRepository {
  async list(_entity, _search) {
    throw new Error("No implementado");
  }

  async listById(_entity, _id) {
    throw new Error("No implementado");
  }

  async create(_entity, _normalizedFields) {
    throw new Error("No implementado");
  }

  async update(_entity, _id, _normalizedChanges) {
    throw new Error("No implementado");
  }

  async setActive(_entity, _id, _isActive) {
    throw new Error("No implementado");
  }

  async countOtherActiveAdmins(_excludedUserId) {
    throw new Error("No implementado");
  }
}
