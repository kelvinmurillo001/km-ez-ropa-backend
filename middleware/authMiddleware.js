// 📁 backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';
import {
  obtenerTokenDesdeHeader,
  enviarError
} from '../utils/admin-auth-utils.js';

/**
 * 🔐 Middleware híbrido de autenticación:
 * - Valida JWT (Authorization: Bearer [token])
 * - O sesión activa (Passport para login con Google)
 */
const authMiddleware = async (req, res, next) => {
  const method = req.method;
  const path = req.originalUrl;

  try {
    // 1️⃣ Autenticación por JWT
    const token = obtenerTokenDesdeHeader(req);
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(decoded.id).select('-password -refreshToken').lean();

        if (!user) {
          logger.warn(`🚫 Usuario no encontrado - ID: ${decoded.id}`);
          return enviarError(res, '🚫 Usuario no válido.', 403);
        }

        if (user.banned) {
          logger.warn(`⛔ Usuario bloqueado - ID: ${user._id}`);
          return enviarError(res, '⛔ Tu cuenta ha sido suspendida.', 403);
        }

        if (user.deleted) {
          logger.warn(`⛔ Usuario eliminado - ID: ${user._id}`);
          return enviarError(res, '⛔ Tu cuenta fue eliminada.', 403);
        }

        req.user = user;
        logger.info(`✅ Autenticado por JWT: ${user.email || user.username} | ${method} ${path}`);
        return next();
      } catch (err) {
        logger.warn(`⛔ JWT inválido o expirado | ${method} ${path} | ${err.message}`);
        return enviarError(res, '⛔ Token inválido o expirado.', 401,
          config.env !== 'production' ? err.message : undefined
        );
      }
    }

    // 2️⃣ Autenticación por sesión activa (Google Passport)
    if (req.isAuthenticated?.() && req.user) {
      req.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      };

      logger.info(`✅ Autenticado por sesión (Google): ${req.user.email} | ${method} ${path}`);
      return next();
    }

    // 3️⃣ No autenticado
    logger.warn(`🔒 Requiere autenticación | ${method} ${path}`);
    return enviarError(res, '🔒 Debes iniciar sesión para continuar.', 401);
  } catch (err) {
    logger.error('❌ Error inesperado en authMiddleware:', err);
    return enviarError(
      res,
      '❌ Error interno de autenticación.',
      500,
      config.env !== 'production' ? err.message : undefined
    );
  }
};

export default authMiddleware;
