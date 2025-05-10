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
 * 🔐 Middleware híbrido:
 * Verifica autenticación por JWT (Bearer) o sesión activa (Passport)
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 🧾 1. Intentar con token JWT
    const token = obtenerTokenDesdeHeader(req);

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(decoded.id).select('-password -refreshToken').lean();

        if (!user || user.banned || user.deleted) {
          logger.warn(`🚫 Usuario inválido o bloqueado: ${decoded.id}`);
          return enviarError(res, '🚫 Usuario no autorizado o eliminado.', 403);
        }

        req.user = user;
        return next();
      } catch (err) {
        logger.warn(`⛔ Token JWT inválido: ${err.message}`);
        return enviarError(res, '⛔ Token inválido o expirado.', 401, err.message);
      }
    }

    // 🧪 2. Intentar con sesión activa (Passport)
    if (req.isAuthenticated?.() && req.user) {
      req.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      };
      return next();
    }

    // ❌ 3. No autenticado
    logger.warn('🔒 Requiere autenticación (sin token ni sesión)');
    return enviarError(res, '🔒 Debes iniciar sesión para continuar.', 401);
  } catch (err) {
    logger.error('❌ Error inesperado en authMiddleware:', err);
    return enviarError(
      res,
      '❌ Error interno de autenticación.',
      500,
      config.env !== 'production' ? err.message : null
    );
  }
};

export default authMiddleware;
