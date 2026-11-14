import { AppError } from "../../shared/errors/AppError.js";
import { env } from "../../config/env.js";

export function makeModerationService({
  graduateRepository,
  userRepository,
  notificationRepository,
  emailService,
  auditLogRepository,
}) {
  return {
    async requestPublish(userId) {
      const graduate = await graduateRepository.findByUserId(userId);
      if (!graduate) throw new AppError("Perfil de egresado no encontrado", 404);

      const beforeState = {
        moderationStatus: graduate.moderationStatus,
        visibility: graduate.visibility,
      };

      const updated = await graduateRepository.requestPublish(graduate.id);

      if (auditLogRepository) {
        const user = await userRepository.findById(userId);
        await auditLogRepository.create({
          userId,
          userEmail: user?.email,
          userRole: user?.role || "graduate",
          entityType: "graduate_moderation",
          entityId: graduate.id,
          action: "solicitar_publicacion",
          details: `El egresado ${graduate.firstName} ${graduate.lastName} (${graduate.registrationCode}) solicitó la publicación de su ficha.`,
          beforeState,
          afterState: { moderationStatus: "pending_review", visibility: "private" },
        }).catch(console.error);
      }

      // Notificar a todos los administradores
      const admins = await userRepository.listAdmins();
      const graduateName = `${graduate.firstName} ${graduate.lastName}`;
      const reviewLink = `/perfil.html?codigo=${encodeURIComponent(graduate.registrationCode)}`;

      for (const admin of admins) {
        await notificationRepository.create({
          userId: admin.id,
          title: "Solicitud de publicación de ficha",
          message: `El egresado ${graduateName} (${graduate.registrationCode}) ha solicitado la revisión y publicación de su ficha.`,
          link: reviewLink,
          type: "moderation_request",
        });

        if (admin.emailVerified) {
          await emailService.sendNotificationEmail({
            to: admin.email,
            name: "Administrador",
            title: "Solicitud de publicación de ficha",
            message: `El egresado ${graduateName} (${graduate.registrationCode}) ha solicitado la revisión y publicación de su ficha en el directorio.`,
            link: `${env.frontendUrl}${reviewLink}`,
          }).catch(console.error);
        }
      }

      return {
        success: true,
        message: "Tu solicitud de publicación ha sido enviada para revisión del administrador.",
        graduate: updated,
      };
    },

    async moderateGraduate(adminUserId, graduateId, { action, observations, makePublic }) {
      const admin = await userRepository.findById(adminUserId);
      if (!admin || !admin.isAdmin()) throw new AppError("No autorizado", 403);

      const graduate = await graduateRepository.findById(graduateId);
      if (!graduate) throw new AppError("Perfil no encontrado", 404);

      const graduateUser = await userRepository.findById(graduate.userId);

      if (action === "observe") {
        if (!observations || !observations.trim()) {
          throw new AppError("Debes escribir una observación para enviar.", 400);
        }

        const beforeState = {
          moderationStatus: graduate.moderationStatus,
          visibility: graduate.visibility,
          observations: graduate.moderationObservations,
        };

        const updated = await graduateRepository.setModeration(graduate.id, {
          status: "observed",
          observations: observations.trim(),
          visibility: "private",
        });

        if (auditLogRepository) {
          await auditLogRepository.create({
            userId: adminUserId,
            userEmail: admin?.email,
            userRole: "admin",
            entityType: "graduate_moderation",
            entityId: graduate.id,
            action: "observar_ficha",
            details: `Observación enviada a ${graduate.firstName} ${graduate.lastName}: "${observations.trim()}"`,
            beforeState,
            afterState: { moderationStatus: "observed", visibility: "private", observations: observations.trim() },
          }).catch(console.error);
        }

        const notifyLink = `/dashboard.html`;
        await notificationRepository.create({
          userId: graduate.userId,
          title: "Observaciones en tu ficha profesional",
          message: `El administrador ha revisado tu ficha y dejó observaciones:\n"${observations.trim()}". Por favor realiza las correcciones y vuelve a solicitar publicación.`,
          link: notifyLink,
          type: "moderation_observation",
        });

        if (graduateUser && graduateUser.emailVerified) {
          await emailService.sendNotificationEmail({
            to: graduateUser.email,
            name: `${graduate.firstName} ${graduate.lastName}`,
            title: "Observaciones en tu ficha profesional",
            message: `El administrador revisó tu ficha profesional y requiere las siguientes correcciones:\n\n"${observations.trim()}"\n\nIngresa a tu ficha para corregirlas y solicitar publicación nuevamente.`,
            link: `${env.frontendUrl}${notifyLink}`,
          }).catch(console.error);
        }

        return { success: true, message: "Observaciones enviadas al egresado.", graduate: updated };
      }

      if (action === "approve") {
        const isPublic = Boolean(makePublic);
        const beforeState = {
          moderationStatus: graduate.moderationStatus,
          visibility: graduate.visibility,
          observations: graduate.moderationObservations,
        };

        const updated = await graduateRepository.setModeration(graduate.id, {
          status: "approved",
          observations: null,
          visibility: isPublic ? "public" : "private",
        });

        if (auditLogRepository) {
          await auditLogRepository.create({
            userId: adminUserId,
            userEmail: admin?.email,
            userRole: "admin",
            entityType: "graduate_moderation",
            entityId: graduate.id,
            action: isPublic ? "aprobar_y_publicar_ficha" : "aprobar_ficha_privada",
            details: isPublic
              ? `Ficha de ${graduate.firstName} ${graduate.lastName} aprobada y publicada en el directorio.`
              : `Ficha de ${graduate.firstName} ${graduate.lastName} aprobada como privada.`,
            beforeState,
            afterState: { moderationStatus: "approved", visibility: isPublic ? "public" : "private", observations: null },
          }).catch(console.error);
        }

        const notifyLink = `/perfil.html?codigo=${encodeURIComponent(graduate.registrationCode)}`;
        await notificationRepository.create({
          userId: graduate.userId,
          title: isPublic ? "¡Tu ficha profesional ha sido publicada!" : "Ficha profesional aprobada",
          message: isPublic
            ? "El administrador ha aprobado y publicado tu ficha profesional en el directorio público."
            : "El administrador ha aprobado tu ficha profesional. Actualmente se encuentra visible solo con tu enlace.",
          link: notifyLink,
          type: "moderation_approved",
        });

        if (graduateUser && graduateUser.emailVerified) {
          await emailService.sendNotificationEmail({
            to: graduateUser.email,
            name: `${graduate.firstName} ${graduate.lastName}`,
            title: isPublic ? "¡Ficha Profesional Publicada!" : "Ficha Profesional Aprobada",
            message: isPublic
              ? "¡Felicitaciones! El administrador ha aprobado y publicado tu perfil en el Directorio de Egresados UAJMS."
              : "El administrador ha aprobado los contenidos de tu ficha profesional.",
            link: `${env.frontendUrl}${notifyLink}`,
          }).catch(console.error);
        }

        return {
          success: true,
          message: isPublic ? "Ficha aprobada y publicada con éxito." : "Ficha aprobada como privada.",
          graduate: updated,
        };
      }

      throw new AppError("Acción de moderación no reconocida", 400);
    },
  };
}
