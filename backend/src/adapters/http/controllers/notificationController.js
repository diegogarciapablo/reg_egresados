export function makeNotificationController({ notificationService }) {
  return {
    async listMine(req, res, next) {
      try {
        const result = await notificationService.getMyNotifications(req.session?.userId);
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async markRead(req, res, next) {
      try {
        const result = await notificationService.markAsRead(req.session?.userId, req.params.id);
        res.json(result);
      } catch (err) {
        next(err);
      }
    },

    async markAllRead(req, res, next) {
      try {
        const result = await notificationService.markAllAsRead(req.session?.userId);
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  };
}
