export function makeCoverLetterController({
  createCoverLetter,
  listCoverLetters,
  getCoverLetter,
  updateCoverLetter,
  setCoverLetterSelections,
}) {
  return {
    async list(req, res, next) {
      try {
        const letters = await listCoverLetters({ userId: req.session.userId });
        res.json(letters);
      } catch (err) {
        next(err);
      }
    },

    async create(req, res, next) {
      try {
        const letter = await createCoverLetter({ userId: req.session.userId, data: req.validatedBody });
        res.status(201).json(letter);
      } catch (err) {
        next(err);
      }
    },

    async getOne(req, res, next) {
      try {
        const letter = await getCoverLetter({ userId: req.session.userId, coverLetterId: req.params.id });
        res.json(letter);
      } catch (err) {
        next(err);
      }
    },

    async patch(req, res, next) {
      try {
        const letter = await updateCoverLetter({
          userId: req.session.userId,
          coverLetterId: req.params.id,
          changes: req.validatedBody,
        });
        res.json(letter);
      } catch (err) {
        next(err);
      }
    },

    async putTechnologies(req, res, next) {
      try {
        const result = await setCoverLetterSelections({
          userId: req.session.userId,
          coverLetterId: req.params.id,
          technologyIds: req.body.technologyIds ?? [],
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async putSoftSkills(req, res, next) {
      try {
        const result = await setCoverLetterSelections({
          userId: req.session.userId,
          coverLetterId: req.params.id,
          softSkillIds: req.body.softSkillIds ?? [],
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async putSelections(req, res, next) {
      try {
        const result = await setCoverLetterSelections({
          userId: req.session.userId,
          coverLetterId: req.params.id,
          technologyIds: req.body.technologyIds ?? [],
          softSkillIds: req.body.softSkillIds ?? [],
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async print(req, res) {
      // MVP: la generacion de PDF ocurre en el navegador.
      // Este endpoint queda reservado para un adaptador con Puppeteer a futuro.
      res.status(501).json({ error: "Generacion de PDF en servidor no implementada aun" });
    },
  };
}
