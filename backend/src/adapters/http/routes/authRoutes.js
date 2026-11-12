import { Router } from "express";
import { validateBody, registerSchema, loginSchema, changePasswordSchema } from "../../../shared/validation/schemas.js";

export function authRoutes(authController) {
  const router = Router();

  router.post("/register", validateBody(registerSchema), authController.register);
  router.post("/login", validateBody(loginSchema), authController.login);
  router.post("/logout", authController.logout);
  router.get("/me", authController.me);
  router.post("/change-password", validateBody(changePasswordSchema), authController.changePassword);
  router.post("/email-verification/request", authController.requestVerification);
  router.post("/verify-email", authController.verifyEmail);

  return router;
}
