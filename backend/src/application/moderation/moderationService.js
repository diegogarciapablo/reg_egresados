import { AppError } from "../../shared/errors/AppError.js";
import { env } from "../../config/env.js";

export function makeModerationService({
  graduateRepository,
  userRepository,
  notificationRepository,
  emailService,
}) {
  return {
    async requestPublish(userId) {
      const graduate = await graduateRepository.findByUserId(userId);
      if (!graduate) throw new AppError("Perfil de egresado no encontrado", 404);

      const updated = await graduateRepository.requestPublish(graduate.id);

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

        const updated = await graduateRepository.setModeration(graduate.id, {
          status: "observed",
          observations: observations.trim(),
          visibility: "private",
        });

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
        const updated = await graduateRepository.setModeration(graduate.id, {
          status: "approved",
          observations: null,
          visibility: isPublic ? "public" : "private",
        });

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
