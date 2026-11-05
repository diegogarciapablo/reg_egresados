import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieSession from "cookie-session";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { env } from "./config/env.js";
import { pool, withTransaction } from "./config/database.js";

// Repositorios (adaptadores de persistencia)
import { PgUserRepository } from "./adapters/persistence/postgres/repositories/PgUserRepository.js";
import { PgGraduateRepository } from "./adapters/persistence/postgres/repositories/PgGraduateRepository.js";
import { PgRecommendationRepository } from "./adapters/persistence/postgres/repositories/PgRecommendationRepository.js";
import { PgCoverLetterRepository } from "./adapters/persistence/postgres/repositories/PgCoverLetterRepository.js";
import { PgAdminEntityRepository } from "./adapters/persistence/postgres/repositories/PgAdminEntityRepository.js";
import { ProfilePhotoStore } from "./adapters/persistence/filesystem/ProfilePhotoStore.js";
import { CertificateFileStore } from "./adapters/persistence/filesystem/CertificateFileStore.js";
import { makeCatalogQueries } from "./adapters/persistence/postgres/queries/catalogQueries.js";

// Casos de uso (aplicacion)
import { makeRegisterUser } from "./application/auth/registerUser.js";
import { makeLoginUser } from "./application/auth/loginUser.js";
import { makeGetCurrentUser } from "./application/auth/getCurrentUser.js";
import { makeGetDirectory } from "./application/graduate/getDirectory.js";
import { makeGetPublicProfile } from "./application/graduate/getPublicProfile.js";
import {
  makeGetMyProfile,
  makeUpdateGraduateProfile,
  makeUpdateVisibility,
} from "./application/graduate/updateGraduateProfile.js";
import {
  makeUploadProfilePhoto,
  makeGetProfilePhoto,
  makeDeleteProfilePhoto,
} from "./application/graduate/manageProfilePhoto.js";
import {
  makeUpdateGraduateTechnologies,
  makeUpdateGraduateSoftSkills,
  makeUpdateGraduateProjects,
  makeUpdateGraduateExperiences,
  makeUpdateGraduateCertificates,
  makeUploadCertificateFile,
  makeGetCertificateFile,
} from "./application/graduate/updateGraduateLists.js";
import { makeCreateRecommendation, makeModerateRecommendation } from "./application/recommendation/manageRecommendations.js";
import {
  makeCreateCoverLetter,
  makeListCoverLetters,
  makeGetCoverLetter,
  makeUpdateCoverLetter,
  makeSetCoverLetterSelections,
} from "./application/coverLetter/manageCoverLetters.js";
import {
  makeListAllGraduates,
  makeUpdateGraduateStatus,
  makeListAdminEntityDefinitions,
  makeListAdminEntityRows,
  makeCreateAdminEntity,
  makeUpdateAdminEntity,
  makeSetAdminEntityActive,
} from "./application/admin/adminUseCases.js";

// HTTP (adaptador de entrada)
import { makeAuthController } from "./adapters/http/controllers/authController.js";
import { makeDirectoryController } from "./adapters/http/controllers/directoryController.js";
import { makeProfileController } from "./adapters/http/controllers/profileController.js";
import { makeRecommendationController } from "./adapters/http/controllers/recommendationController.js";
import { makeCoverLetterController } from "./adapters/http/controllers/coverLetterController.js";
import { makeAdminController } from "./adapters/http/controllers/adminController.js";

import { authRoutes } from "./adapters/http/routes/authRoutes.js";
import { publicRoutes } from "./adapters/http/routes/publicRoutes.js";
import { meRoutes } from "./adapters/http/routes/meRoutes.js";
import { adminRoutes } from "./adapters/http/routes/adminRoutes.js";
import { makeLoadUser } from "./adapters/http/middleware/auth.js";
import { errorHandler, notFoundHandler } from "./adapters/http/middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // --- Repositorios ---
  const userRepository = new PgUserRepository(pool);
  const graduateRepository = new PgGraduateRepository(pool);
  const recommendationRepository = new PgRecommendationRepository(pool);
  const coverLetterRepository = new PgCoverLetterRepository(pool);
  const adminEntityRepository = new PgAdminEntityRepository(pool);
  const profilePhotoStore = new ProfilePhotoStore();
  const certificateFileStore = new CertificateFileStore();
  const catalogQueries = makeCatalogQueries(pool);

  // --- Casos de uso ---
  const registerUser = makeRegisterUser({ userRepository, graduateRepository, withTransaction });
  const loginUser = makeLoginUser({ userRepository });
  const getCurrentUser = makeGetCurrentUser({ userRepository });
  const getDirectory = makeGetDirectory({ graduateRepository });
  const getPublicProfile = makeGetPublicProfile({ graduateRepository });
  const getMyProfile = makeGetMyProfile({ graduateRepository });
  const updateGraduateProfile = makeUpdateGraduateProfile({ graduateRepository });
  const updateVisibility = makeUpdateVisibility({ graduateRepository });
  const uploadProfilePhoto = makeUploadProfilePhoto({ graduateRepository, profilePhotoStore });
  const getProfilePhoto = makeGetProfilePhoto({ graduateRepository, profilePhotoStore });
  const deleteProfilePhoto = makeDeleteProfilePhoto({ graduateRepository, profilePhotoStore });
  const updateGraduateTechnologies = makeUpdateGraduateTechnologies({ graduateRepository });
  const updateGraduateSoftSkills = makeUpdateGraduateSoftSkills({ graduateRepository });
  const updateGraduateProjects = makeUpdateGraduateProjects({ graduateRepository });
  const updateGraduateExperiences = makeUpdateGraduateExperiences({ graduateRepository });
  const updateGraduateCertificates = makeUpdateGraduateCertificates({ graduateRepository });
  const uploadCertificateFile = makeUploadCertificateFile({ graduateRepository, certificateFileStore });
  const getCertificateFile = makeGetCertificateFile({ graduateRepository, certificateFileStore });
  const createRecommendation = makeCreateRecommendation({ recommendationRepository, graduateRepository });
  const moderateRecommendation = makeModerateRecommendation({ recommendationRepository });
  const createCoverLetter = makeCreateCoverLetter({ coverLetterRepository, graduateRepository });
  const listCoverLetters = makeListCoverLetters({ coverLetterRepository, graduateRepository });
  const getCoverLetter = makeGetCoverLetter({ coverLetterRepository, graduateRepository });
  const updateCoverLetter = makeUpdateCoverLetter({ coverLetterRepository, graduateRepository });
  const setCoverLetterSelections = makeSetCoverLetterSelections({ coverLetterRepository, graduateRepository });
  const listAllGraduates = makeListAllGraduates({ graduateRepository });
  const updateGraduateStatus = makeUpdateGraduateStatus({ graduateRepository });
  const listAdminEntityDefinitions = makeListAdminEntityDefinitions();
  const listAdminEntityRows = makeListAdminEntityRows({ adminEntityRepository });
  const createAdminEntity = makeCreateAdminEntity({ adminEntityRepository });
  const updateAdminEntity = makeUpdateAdminEntity({ adminEntityRepository });
  const setAdminEntityActive = makeSetAdminEntityActive({ adminEntityRepository });

  // --- Controladores ---
  const authController = makeAuthController({ registerUser, loginUser, getCurrentUser });
  const directoryController = makeDirectoryController({
    getDirectory,
    getPublicProfile,
    getProfilePhoto,
    getCertificateFile,
    catalogQueries,
  });
  const profileController = makeProfileController({
    getMyProfile,
    updateGraduateProfile,
    updateVisibility,
    uploadProfilePhoto,
    getProfilePhoto,
    deleteProfilePhoto,
    updateGraduateTechnologies,
    updateGraduateSoftSkills,
    updateGraduateProjects,
    updateGraduateExperiences,
    updateGraduateCertificates,
    uploadCertificateFile,
  });
  const recommendationController = makeRecommendationController({ createRecommendation, moderateRecommendation });
  const coverLetterController = makeCoverLetterController({
    createCoverLetter,
    listCoverLetters,
    getCoverLetter,
    updateCoverLetter,
    setCoverLetterSelections,
  });
  const adminController = makeAdminController({
    listAllGraduates,
    moderateRecommendation,
    updateGraduateStatus,
    listAdminEntityDefinitions,
    listAdminEntityRows,
    createAdminEntity,
    updateAdminEntity,
    setAdminEntityActive,
  });

  // --- Middlewares globales ---
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
        },
      },
    })
  );
  app.use(
    cors({
      origin: env.corsOrigin ? env.corsOrigin.split(",").map((o) => o.trim()) : false,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "50kb" }));
  app.use(
    cookieSession({
      name: "session",
      secret: env.sessionSecret,
      httpOnly: true,
      sameSite: "lax",
      secure: env.nodeEnv === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
  );
  app.use(makeLoadUser(userRepository));

  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
  const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
  const recommendationLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15 });

  app.use("/api/auth/login", loginLimiter);
  app.use("/api/auth/register", registerLimiter);
  app.use("/api/graduates/:id/recommendations", recommendationLimiter);

  // --- Rutas API ---
  app.use("/api/auth", authRoutes(authController));
  app.use("/api", publicRoutes({ directoryController, recommendationController }));
  app.use("/api/me", meRoutes({ profileController, coverLetterController }));
  app.use("/api/admin", adminRoutes(adminController));

  // --- Frontend estatico ---
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
