import { Router } from "express";
import multer from "multer";
import { AppError } from "../../../shared/errors/AppError.js";
import { requireAuth } from "../middleware/auth.js";
import {
  validateBody,
  profileUpdateSchema,
  visibilitySchema,
  technologiesSelectionSchema,
  softSkillsSelectionSchema,
  languagesSelectionSchema,
  projectsSelectionSchema,
  experiencesSelectionSchema,
  certificatesSelectionSchema,
  coverLetterSchema,
  coverLetterSelectionsSchema,
} from "../../../shared/validation/schemas.js";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const parseProfilePhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!allowedImageTypes.has(file.mimetype)) {
      return callback(new AppError("La foto debe ser JPEG, PNG o WebP."));
    }
    callback(null, true);
  },
}).single("photo");

function uploadProfilePhoto(req, res, next) {
  parseProfilePhoto(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("La foto no puede superar los 5 MB."));
    }
    if (error instanceof multer.MulterError) {
      return next(new AppError("Solo se permite subir una foto por solicitud."));
    }
    next(error);
  });
}

const allowedCertificateTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const parseCertificateFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!allowedCertificateTypes.has(file.mimetype)) {
      return callback(new AppError("El certificado debe ser PDF, JPEG, PNG o WebP."));
    }
    callback(null, true);
  },
}).single("certificate");

function uploadCertificateFile(req, res, next) {
  parseCertificateFile(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new AppError("El certificado digital no puede superar los 10 MB."));
    }
    if (error instanceof multer.MulterError) {
      return next(new AppError("Solo se permite subir un archivo por solicitud."));
    }
    next(error);
  });
}

export function meRoutes({ profileController, coverLetterController }) {
  const router = Router();

  router.use(requireAuth);

  router.get("/profile", profileController.getMyProfile);
  router.patch("/profile", validateBody(profileUpdateSchema), profileController.patchProfile);
  router.post("/profile/request-publish", profileController.requestPublish);
  router.get("/profile/photo/:graduateId", profileController.getPhoto);
  router.put("/profile/photo", uploadProfilePhoto, profileController.uploadPhoto);
  router.delete("/profile/photo", profileController.deletePhoto);
  router.put("/profile/technologies", validateBody(technologiesSelectionSchema), profileController.putTechnologies);
  router.put("/profile/soft-skills", validateBody(softSkillsSelectionSchema), profileController.putSoftSkills);
  router.put("/profile/languages", validateBody(languagesSelectionSchema), profileController.putLanguages);
  router.put("/profile/projects", validateBody(projectsSelectionSchema), profileController.putProjects);
  router.put("/profile/experiences", validateBody(experiencesSelectionSchema), profileController.putExperiences);
  router.post("/profile/certificates/file", uploadCertificateFile, profileController.uploadCertificateFile);
  router.put("/profile/certificates", validateBody(certificatesSelectionSchema), profileController.putCertificates);
  router.patch("/profile/visibility", validateBody(visibilitySchema), profileController.patchVisibility);

  router.get("/cover-letters", coverLetterController.list);
  router.post("/cover-letters", validateBody(coverLetterSchema), coverLetterController.create);
  router.get("/cover-letters/:id", coverLetterController.getOne);
  router.patch("/cover-letters/:id", validateBody(coverLetterSchema), coverLetterController.patch);
  router.put("/cover-letters/:id/technologies", validateBody(technologiesSelectionSchema), coverLetterController.putTechnologies);
  router.put("/cover-letters/:id/soft-skills", validateBody(softSkillsSelectionSchema), coverLetterController.putSoftSkills);
  router.put("/cover-letters/:id/selections", validateBody(coverLetterSelectionsSchema), coverLetterController.putSelections);
  router.post("/cover-letters/:id/print", coverLetterController.print);

  return router;
}
