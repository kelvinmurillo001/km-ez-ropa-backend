// 📁 backend/middleware/adminOnly.js

import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';
import { enviarError } from '../utils/admin-auth-utils.js';

/**
 * 🔐 Middleware: Restringe acceso solo a usuarios con rol "admin"
 */
const adminOnly = (req, res, next) => {
  try {
    const user = req.user;

    // 🛑 No autenticado o sin estructura válida
    if (!user || typeof user !== 'object' || !user.role) {
      logger.warn(`❌ Acceso anónimo o sin usuario válido desde IP: ${req.ip}`);
      return enviarError(res, '🚫 Debes iniciar sesión como administrador.', 401);
    }

    const role = String(user.role).trim().toLowerCase();

    if (role !== 'admin') {
      logger.warn(`⛔ Acceso no autorizado. Usuario: ${user._id || '¿sin ID?'} (rol: ${role}) - IP: ${req.ip}`);
      return enviarError(res, '⛔ Acción denegada. Requiere permisos de administrador.', 403);
    }

    // ✅ Usuario autorizado
    next();
  } catch (err) {
    logger.error('❌ Error en adminOnly middleware:', err);
    return enviarError(
      res,
      '❌ Error interno al validar rol de administrador.',
      500,
      config.env !== 'production' ? err.message : undefined
    );
  }
};

export default adminOnly;
