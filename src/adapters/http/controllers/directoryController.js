export function makeDirectoryController({ getDirectory, getPublicProfile, graduateRepository, catalogQueries }) {
  return {
    async health(req, res) {
      res.json({ status: "ok" });
    },

    async list(req, res, next) {
      try {
        const result = await getDirectory(req.validatedQuery);
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async getByCode(req, res, next) {
      try {
        const graduate = await getPublicProfile(req.params.registrationCode);
        const details = await graduateRepository.getFullProfile(graduate.id);
        res.json({ ...graduate, ...details });
      } catch (err) {
        next(err);
      }
    },

    async listTechnologies(req, res, next) {
      try {
        res.json(await catalogQueries.listTechnologies());
      } catch (err) {
        next(err);
      }
    },

    async listSoftSkills(req, res, next) {
      try {
        res.json(await catalogQueries.listSoftSkills());
      } catch (err) {
        next(err);
      }
    },
  };
}
