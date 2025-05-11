// 📁 backend/middleware/adminOnly.js

import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';
import { enviarError } from '../utils/admin-auth-utils.js';

/**
 * 🔐 Middleware: Restringe acceso solo a usuarios con rol "admin"
 */
const adminOnly = (req, res, next) => {
  try {
    const { user } = req;

    if (!user || typeof user !== 'object') {
      logger.warn(`❌ Acceso anónimo o sin user object válido - IP: ${req.ip} - ${req.method} ${req.originalUrl}`);
      return enviarError(res, '🚫 Debes iniciar sesión como administrador.', 401);
    }

    const role = String(user.role || '').trim().toLowerCase();
    const userId = user._id || user.id || 'sin ID';

    if (role !== 'admin') {
      logger.warn(`⛔ Acceso no autorizado. Usuario: ${userId} (rol: ${role}) - IP: ${req.ip}`);
      return enviarError(res, '⛔ Acción denegada. Requiere permisos de administrador.', 403);
    }

    logger.info(`✅ Acceso autorizado para admin: ${user.username || user.email || userId} - ${req.method} ${req.originalUrl}`);
    next();
  } catch (err) {
    logger.error('❌ Error en middleware adminOnly:', err);
    return enviarError(
      res,
      '❌ Error interno al validar permisos de administrador.',
      500,
      config.env !== 'production' ? err.message : undefined
    );
  }
};

export default adminOnly;
