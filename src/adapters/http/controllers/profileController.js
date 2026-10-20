import { AppError } from "../../../shared/errors/AppError.js";

export function makeProfileController({
  graduateRepository,
  profilePhotoStore,
  updateGraduateProfile,
  updateVisibility,
  updateGraduateTechnologies,
  updateGraduateSoftSkills,
  updateGraduateProjects,
  updateGraduateExperiences,
}) {
  return {
    async getMyProfile(req, res, next) {
      try {
        const graduate = await graduateRepository.findByUserId(req.session.userId);
        if (!graduate) return res.status(404).json({ error: "No tienes ficha asociada" });
        const details = await graduateRepository.getFullProfile(graduate.id);
        res.json({ ...graduate, ...details });
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
        if (!req.file) throw new AppError("Selecciona una foto para subir.");
        const graduate = await graduateRepository.findByUserId(req.session.userId);
        if (!graduate) return res.status(404).json({ error: "No tienes ficha asociada" });

        const photo = await profilePhotoStore.save(graduate.id, req.file);
        const updated = await graduateRepository.update(graduate.id, { photoUrl: photo.url });
        res.json({ photoUrl: updated.photoUrl });
      } catch (err) {
        next(err);
      }
    },

    async getPhoto(req, res, next) {
      try {
        const graduate = await graduateRepository.findByUserId(req.session.userId);
        if (!graduate || graduate.id !== req.params.graduateId) {
          return res.status(404).json({ error: "Foto no encontrada" });
        }
        if (graduate.photoUrl !== `/api/me/profile/photo/${graduate.id}`) {
          return res.status(404).json({ error: "Foto no encontrada" });
        }

        const photo = await profilePhotoStore.read(graduate.id);
        if (!photo) return res.status(404).json({ error: "Foto no encontrada" });
        res.set("Cache-Control", "private, no-store");
        res.type(photo.contentType).send(photo.buffer);
      } catch (err) {
        next(err);
      }
    },

    async deletePhoto(req, res, next) {
      try {
        const graduate = await graduateRepository.findByUserId(req.session.userId);
        if (!graduate) return res.status(404).json({ error: "No tienes ficha asociada" });
        await graduateRepository.update(graduate.id, { photoUrl: null });
        await profilePhotoStore.remove(graduate.id);
        res.json({ photoUrl: null });
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
        const result = await updateGraduateProjects({ userId: req.session.userId, projects: req.body.projects ?? [] });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async putExperiences(req, res, next) {
      try {
        const result = await updateGraduateExperiences({ userId: req.session.userId, experiences: req.body.experiences ?? [] });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  };
}
