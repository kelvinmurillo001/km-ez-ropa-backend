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
 * - Valida JWT en header Authorization: Bearer [token]
 * - O bien sesión activa (Passport para Google login)
 */
const authMiddleware = async (req, res, next) => {
  try {
    const method = req.method;
    const path = req.originalUrl;

    // 1️⃣ INTENTAR CON JWT (Bearer token)
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
          logger.warn(`🚫 Usuario bloqueado: ${user._id}`);
          return enviarError(res, '⛔ Tu cuenta está suspendida.', 403);
        }

        if (user.deleted) {
          logger.warn(`🚫 Usuario eliminado: ${user._id}`);
          return enviarError(res, '⛔ Usuario eliminado.', 403);
        }

        req.user = user;
        logger.info(`✅ Autenticado por token: ${user.email || user.username} - ${method} ${path}`);
        return next();
      } catch (err) {
        logger.warn(`⛔ JWT inválido: ${err.message} - ${method} ${path}`);
        return enviarError(res, '⛔ Token inválido o expirado.', 401,
          config.env !== 'production' ? err.message : undefined
        );
      }
    }

    // 2️⃣ INTENTAR CON SESIÓN ACTIVA (Passport)
    if (req.isAuthenticated?.() && req.user) {
      req.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      };

      logger.info(`✅ Autenticado por sesión: ${req.user.email || req.user.id} - ${method} ${path}`);
      return next();
    }

    // 3️⃣ NO AUTENTICADO
    logger.warn(`🔒 Requiere autenticación - ${method} ${path}`);
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
