export function makeCatalogQueries(pool) {
  return {
    async listTechnologies() {
      const { rows } = await pool.query("SELECT id, name, slug FROM technologies WHERE is_active = TRUE ORDER BY name");
      return rows;
    },
    async listSoftSkills() {
      const { rows } = await pool.query("SELECT id, name, slug FROM soft_skills WHERE is_active = TRUE ORDER BY name");
      return rows;
    },
  };
}
