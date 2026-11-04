export function makeProfileController({
  getMyProfile,
  updateGraduateProfile,
  updateVisibility,
  uploadProfilePhoto,
  getProfilePhoto,
  deleteProfilePhoto,
  updateGraduateTechnologies,
  updateGraduateSoftSkills,
  updateGraduateProjects,
  updateGraduateExperiences,
}) {
  return {
    async getMyProfile(req, res, next) {
      try {
        const profile = await getMyProfile({ userId: req.session.userId });
        res.json(profile);
      } catch (err) {
        next(err);
      }
    },

    async patchProfile(req, res, next) {
      try {
        const graduate = await updateGraduateProfile({ userId: req.session.userId, changes: req.validatedBody });
        res.json(graduate);
      } catch (err) {
        next(err);
      }
    },

    async patchVisibility(req, res, next) {
      try {
        const graduate = await updateVisibility({ userId: req.session.userId, visibility: req.validatedBody.visibility });
        res.json(graduate);
      } catch (err) {
        next(err);
      }
    },

    async uploadPhoto(req, res, next) {
      try {
        const result = await uploadProfilePhoto({ userId: req.session.userId, file: req.file });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async getPhoto(req, res, next) {
      try {
        const photo = await getProfilePhoto({
          userId: req.session.userId,
          graduateId: req.params.graduateId,
        });
        res.set("Cache-Control", "private, no-store");
        res.type(photo.contentType).send(photo.buffer);
      } catch (err) {
        next(err);
      }
    },

    async deletePhoto(req, res, next) {
      try {
        const result = await deleteProfilePhoto({ userId: req.session.userId });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async putTechnologies(req, res, next) {
      try {
        const result = await updateGraduateTechnologies({ userId: req.session.userId, technologyIds: req.validatedBody.technologyIds });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async putSoftSkills(req, res, next) {
      try {
        const result = await updateGraduateSoftSkills({ userId: req.session.userId, softSkillIds: req.validatedBody.softSkillIds });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async putProjects(req, res, next) {
      try {
        const result = await updateGraduateProjects({ userId: req.session.userId, projects: req.validatedBody.projects });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async putExperiences(req, res, next) {
      try {
        const result = await updateGraduateExperiences({ userId: req.session.userId, experiences: req.validatedBody.experiences });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  };
}
