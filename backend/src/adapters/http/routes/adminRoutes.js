import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  validateBody,
  moderateRecommendationSchema,
  visibilitySchema,
} from "../../../shared/validation/schemas.js";

export function adminRoutes(adminController, profileController) {
  const router = Router();

  router.use(requireAuth, requireAdmin);

  router.get("/entities", adminController.listEntityDefinitions);
  router.get("/entities/:entity", adminController.listEntityRows);
  router.post("/entities/:entity", adminController.createEntity);
  router.patch("/entities/:entity/:id/active", adminController.setEntityActive);
  router.patch("/entities/:entity/:id", adminController.updateEntity);
  router.get("/graduates", adminController.listGraduates);
  router.patch("/recommendations/:id", validateBody(moderateRecommendationSchema), adminController.moderateRecommendation);
  router.patch("/graduates/:id/status", validateBody(visibilitySchema), adminController.updateGraduateStatus);
  router.post("/graduates/:id/moderate", profileController.moderateGraduate);

  return router;
}
