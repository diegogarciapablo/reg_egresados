export function makeAdminController({
  listAllGraduates,
  moderateRecommendation,
  updateGraduateStatus,
  adminEntityRepository,
}) {
  return {
    async listEntityDefinitions(req, res, next) {
      try {
        res.json(adminEntityRepository.definitions());
      } catch (err) {
        next(err);
      }
    },

    async listEntityRows(req, res, next) {
      try {
        const items = await adminEntityRepository.list(req.params.entity, req.query.q || "");
        res.json(items);
      } catch (err) {
        next(err);
      }
    },

    async updateEntity(req, res, next) {
      try {
        const result = await adminEntityRepository.update(
          req.params.entity,
          req.params.id,
          req.body.changes,
        );
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async setEntityActive(req, res, next) {
      try {
        const result = await adminEntityRepository.setActive(
          req.params.entity,
          req.params.id,
          req.body.isActive,
          req.session.userId,
        );
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async listGraduates(req, res, next) {
      try {
        const result = await listAllGraduates({
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 20,
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async moderateRecommendation(req, res, next) {
      try {
        const recommendation = await moderateRecommendation({ id: req.params.id, status: req.body.status });
        res.json(recommendation);
      } catch (err) {
        next(err);
      }
    },

    async updateGraduateStatus(req, res, next) {
      try {
        const graduate = await updateGraduateStatus({
          graduateId: req.params.id,
          visibility: req.body.visibility,
        });
        res.json(graduate);
      } catch (err) {
        next(err);
      }
    },
  };
}
