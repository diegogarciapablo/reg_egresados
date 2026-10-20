export function makeAuthController({ registerUser, loginUser, userRepository }) {
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
        if (!req.session || !req.session.userId) {
          return res.json({ user: null });
        }
        const user = await userRepository.findById(req.session.userId);
        res.json({ user: user ? user.toSafeObject() : null });
      } catch (err) {
        next(err);
      }
    },
  };
}
