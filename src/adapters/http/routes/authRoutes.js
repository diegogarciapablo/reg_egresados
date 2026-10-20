import { Router } from "express";
import { validateBody, registerSchema, loginSchema } from "../../../shared/validation/schemas.js";

export function authRoutes(authController) {
  const router = Router();

  router.post("/register", validateBody(registerSchema), authController.register);
  router.post("/login", validateBody(loginSchema), authController.login);
  router.post("/logout", authController.logout);
  router.get("/me", authController.me);

  return router;
}
