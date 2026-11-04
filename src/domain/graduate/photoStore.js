/**
 * Puerto de salida (interfaz) para el almacenamiento de fotos de perfil.
 */
export class PhotoStore {
  async save(_graduateId, _file) {
    throw new Error("No implementado");
  }

  async read(_graduateId) {
    throw new Error("No implementado");
  }

  async remove(_graduateId) {
    throw new Error("No implementado");
  }
}
