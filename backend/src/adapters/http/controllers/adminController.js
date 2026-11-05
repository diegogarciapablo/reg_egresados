export function makeAdminController({
  listAllGraduates,
  moderateRecommendation,
  updateGraduateStatus,
  listAdminEntityDefinitions,
  listAdminEntityRows,
  createAdminEntity,
  updateAdminEntity,
  setAdminEntityActive,
}) {
  return {
    async listEntityDefinitions(req, res, next) {
      try {
        res.json(listAdminEntityDefinitions());
      } catch (err) {
        next(err);
      }
    },

    async listEntityRows(req, res, next) {
      try {
        const items = await listAdminEntityRows({
          entity: req.params.entity,
          search: req.query.q || "",
        });
        res.json(items);
      } catch (err) {
        next(err);
      }
    },

    async createEntity(req, res, next) {
      try {
        const created = await createAdminEntity({
          entity: req.params.entity,
          data: req.body.data ?? req.body,
        });
        res.status(201).json(created);
      } catch (err) {
        next(err);
      }
    },

    async updateEntity(req, res, next) {
      try {
        const result = await updateAdminEntity({
          entity: req.params.entity,
          id: req.params.id,
          changes: req.body.changes,
          actorId: req.session.userId,
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async setEntityActive(req, res, next) {
      try {
        const result = await setAdminEntityActive({
          entity: req.params.entity,
          id: req.params.id,
          isActive: req.body.isActive,
          actorId: req.session.userId,
        });
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
        const recommendation = await moderateRecommendation({ id: req.params.id, status: req.validatedBody.status });
        res.json(recommendation);
      } catch (err) {
        next(err);
      }
    },

    async updateGraduateStatus(req, res, next) {
      try {
        const graduate = await updateGraduateStatus({
          graduateId: req.params.id,
          visibility: req.validatedBody.visibility,
        });
        res.json(graduate);
      } catch (err) {
        next(err);
      }
    },
  };
}
