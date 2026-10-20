import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

export function adminRoutes(adminController) {
  const router = Router();

  router.use(requireAuth, requireAdmin);

  router.get("/entities", adminController.listEntityDefinitions);
  router.get("/entities/:entity", adminController.listEntityRows);
  router.patch("/entities/:entity/:id/active", adminController.setEntityActive);
  router.patch("/entities/:entity/:id", adminController.updateEntity);
  router.get("/graduates", adminController.listGraduates);
  router.patch("/recommendations/:id", adminController.moderateRecommendation);
  router.patch("/graduates/:id/status", adminController.updateGraduateStatus);

  return router;
}
