export function makeDirectoryController({ getDirectory, getPublicProfile, getProfilePhoto, catalogQueries }) {
  return {
    async health(req, res) {
      res.json({ status: "ok" });
    },

    async getPhoto(req, res, next) {
      try {
        const photo = await getProfilePhoto({
          userId: req.session?.userId,
          graduateId: req.params.graduateId,
        });
        res.set("Cache-Control", "private, no-store");
        res.type(photo.contentType).send(photo.buffer);
      } catch (err) {
        next(err);
      }
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
        const profile = await getPublicProfile(req.params.registrationCode);
        res.json(profile);
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
