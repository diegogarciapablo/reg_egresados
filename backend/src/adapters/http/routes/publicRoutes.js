import { Router } from "express";
import { validateBody, validateQuery, directoryQuerySchema, recommendationSchema } from "../../../shared/validation/schemas.js";

export function publicRoutes({ directoryController, recommendationController }) {
  const router = Router();

  router.get("/health", directoryController.health);
  router.get("/graduates", validateQuery(directoryQuerySchema), directoryController.list);
  router.get("/graduates/photo/:graduateId", directoryController.getPhoto);
  router.get("/graduates/certificates/:graduateId/:filename", directoryController.getCertificateFile);
  router.get("/graduates/:registrationCode", directoryController.getByCode);
  router.get("/catalogs/technologies", directoryController.listTechnologies);
  router.get("/catalogs/soft-skills", directoryController.listSoftSkills);
  router.post(
    "/graduates/:id/recommendations",
    validateBody(recommendationSchema),
    recommendationController.create
  );

  return router;
}
