import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';
import {
  obtenerTokenDesdeHeader,
  enviarError
} from '../utils/admin-auth-utils.js';

/**
 * 🔐 Middleware de autenticación:
 * - Permite acceso con JWT válido o sesión activa (Passport).
 */
const authMiddleware = async (req, res, next) => {
  const { method, originalUrl } = req;

  try {
    // 1️⃣ Autenticación vía JWT
    const token = obtenerTokenDesdeHeader(req);

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        if (!decoded?.id) {
          return enviarError(res, '⛔ Token mal formado.', 401);
        }

        const user = await User.findById(decoded.id)
          .select('-password -refreshToken')
          .lean();

        if (!user) {
          logger.warn(`🚫 Usuario no encontrado | ID: ${decoded.id}`);
          return enviarError(res, '🚫 Usuario no válido.', 403);
        }

        if (user.banned) {
          logger.warn(`⛔ Usuario bloqueado | ID: ${user._id}`);
          return enviarError(res, '⛔ Tu cuenta ha sido suspendida.', 403);
        }

        if (user.deleted) {
          logger.warn(`🗑️ Usuario eliminado | ID: ${user._id}`);
          return enviarError(res, '⛔ Tu cuenta fue eliminada.', 403);
        }

        req.user = user;
        logger.info(`✅ Autenticado por JWT | ${user.email || user.username || user.id} | ${method} ${originalUrl}`);
        return next();
      } catch (err) {
        logger.warn(`⛔ JWT inválido o expirado | ${method} ${originalUrl} | ${err.message}`);
        return enviarError(res, '⛔ Token inválido o expirado.', 401,
          config.env !== 'production' ? err.message : undefined
        );
      }
    }

    // 2️⃣ Autenticación vía sesión activa (Passport)
    if (typeof req.isAuthenticated === 'function' && req.isAuthenticated() && req.user) {
      req.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      };

      logger.info(`✅ Autenticado por sesión activa | ${req.user.email || req.user.id} | ${method} ${originalUrl}`);
      return next();
    }

    // 3️⃣ No autenticado
    logger.warn(`🔒 Acceso no autorizado | ${method} ${originalUrl}`);
    return enviarError(res, '🔒 Debes iniciar sesión para continuar.', 401);
  } catch (err) {
    logger.error(`❌ Error en authMiddleware | ${method} ${originalUrl}:`, err);
    return enviarError(res, '❌ Error interno de autenticación.', 500,
      config.env !== 'production' ? err.message : undefined
    );
  }
};

export default authMiddleware;
