import { CatalogRepository } from "../../../../domain/catalog/catalogRepository.js";

export class PgCatalogRepository extends CatalogRepository {
  constructor(pool) {
    super();
    this.pool = pool;
  }

  async listTechnologies() {
    const { rows } = await this.pool.query(
      "SELECT id, name, slug, specialty FROM technologies WHERE is_active = TRUE ORDER BY specialty ASC, name ASC"
    );
    return rows;
  }

  async listSoftSkills() {
    const { rows } = await this.pool.query(
      "SELECT id, name, slug FROM soft_skills WHERE is_active = TRUE ORDER BY name"
    );
    return rows;
  }

  async listLanguages() {
    const { rows } = await this.pool.query(
      "SELECT id, name, slug FROM languages WHERE is_active = TRUE ORDER BY name"
    );
    return rows;
  }
}
