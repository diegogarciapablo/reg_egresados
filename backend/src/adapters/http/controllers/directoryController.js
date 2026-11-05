export function makeDirectoryController({
  getDirectory,
  getPublicProfile,
  getProfilePhoto,
  getCertificateFile,
  listTechnologies,
  listSoftSkills,
}) {
  return {
    async health(req, res) {
      res.json({ status: "ok" });
    },

    async getPhoto(req, res, next) {
      try {
        const photo = await getProfilePhoto({
          userId: req.session?.userId,
          userRole: req.user?.role,
          graduateId: req.params.graduateId,
        });
        res.set("Cache-Control", "private, no-store");
        res.set("X-Content-Type-Options", "nosniff");
        res.set("Content-Security-Policy", "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
        res.type(photo.contentType).send(photo.buffer);
      } catch (err) {
        next(err);
      }
    },

    async getCertificateFile(req, res, next) {
      try {
        const file = await getCertificateFile({
          userId: req.session?.userId,
          userRole: req.user?.role,
          graduateId: req.params.graduateId,
          filename: req.params.filename,
        });
        res.set("Cache-Control", "private, no-store");
        res.set("X-Content-Type-Options", "nosniff");
        res.set("Content-Security-Policy", "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox");
        res.set("Content-Disposition", "inline");
        res.type(file.contentType).send(file.buffer);
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
        res.json(await listTechnologies());
      } catch (err) {
        next(err);
      }
    },

    async listSoftSkills(req, res, next) {
      try {
        res.json(await listSoftSkills());
      } catch (err) {
        next(err);
      }
    },
  };
}
