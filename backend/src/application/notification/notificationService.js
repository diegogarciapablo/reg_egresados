import { AppError } from "../../shared/errors/AppError.js";

export function makeNotificationService({ notificationRepository }) {
  return {
    async getMyNotifications(userId, limit) {
      if (!userId) throw new AppError("No autorizado", 401);
      const items = await notificationRepository.listByUser(userId, { limit });
      const unreadCount = await notificationRepository.countUnread(userId);
      return { items, unreadCount };
    },

    async markAsRead(userId, notificationId) {
      if (!userId) throw new AppError("No autorizado", 401);
      return notificationRepository.markAsRead(notificationId, userId);
    },

    async markAllAsRead(userId) {
      if (!userId) throw new AppError("No autorizado", 401);
      return notificationRepository.markAllAsRead(userId);
    },
  };
}
