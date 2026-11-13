export class NotificationRepository {
  async create({ userId, title, message, link = null, type = "info" }) {
    throw new Error("create no implementado");
  }

  async listByUser(userId, { limit = 20 } = {}) {
    throw new Error("listByUser no implementado");
  }

  async markAsRead(id, userId) {
    throw new Error("markAsRead no implementado");
  }

  async markAllAsRead(userId) {
    throw new Error("markAllAsRead no implementado");
  }

  async countUnread(userId) {
    throw new Error("countUnread no implementado");
  }
}
