export function makeRecommendationController({ createRecommendation, moderateRecommendation }) {
  return {
    async create(req, res, next) {
      try {
        const recommendation = await createRecommendation({
          graduateId: req.params.id,
          ...req.validatedBody,
        });
        res.status(201).json(recommendation);
      } catch (err) {
        next(err);
      }
    },

    async moderate(req, res, next) {
      try {
        const recommendation = await moderateRecommendation({
          id: req.params.id,
          status: req.body.status,
        });
        res.json(recommendation);
      } catch (err) {
        next(err);
      }
    },
  };
}
