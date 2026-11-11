export function makeAuthController({ registerUser, loginUser, getCurrentUser, changePassword }) {
  return {
    async register(req, res, next) {
      try {
        const result = await registerUser(req.validatedBody);
        req.session.userId = result.user.id;
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    },

    async login(req, res, next) {
      try {
        const user = await loginUser(req.validatedBody);
        req.session.userId = user.id;
        res.json({ user });
      } catch (err) {
        next(err);
      }
    },

    async logout(req, res) {
      req.session = null;
      res.status(204).end();
    },

    async me(req, res, next) {
      try {
        const user = await getCurrentUser({ userId: req.session?.userId });
        res.json({ user });
      } catch (err) {
        next(err);
      }
    },

    async changePassword(req, res, next) {
      try {
        const result = await changePassword({
          userId: req.session?.userId,
          currentPassword: req.validatedBody.currentPassword,
          newPassword: req.validatedBody.newPassword,
        });
        res.json(result);
      } catch (err) {
        next(err);
      }
    },
  };
}
