import { UnauthorizedError, ForbiddenError } from "../../../shared/errors/AppError.js";

/**
 * Requiere que exista una sesion activa (req.session.userId, seteada en login).
 */
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return next(new UnauthorizedError("Debes iniciar sesion"));
  }
  next();
}

/**
 * Requiere ademas que el usuario tenga rol admin.
 * Debe usarse despues de requireAuth y de un middleware que cargue req.user.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return next(new ForbiddenError("Requiere rol de administrador"));
  }
  next();
}

/**
 * Carga el usuario completo (req.user) a partir de req.session.userId.
 * Se usa despues de requireAuth.
 */
export function makeLoadUser(userRepository) {
  return async function loadUser(req, res, next) {
    try {
      if (req.session && req.session.userId) {
        const user = await userRepository.findById(req.session.userId);
        if (!user || !user.isActive) {
          req.session = null;
          req.user = null;
        } else {
          req.user = user.toSafeObject();
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
