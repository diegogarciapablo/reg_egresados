import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";

export function notificationRoutes(notificationController) {
  const router = Router();
  router.use(requireAuth);

  router.get("/", notificationController.listMine);
  router.patch("/:id/read", notificationController.markRead);
  router.post("/read-all", notificationController.markAllRead);

  return router;
}
