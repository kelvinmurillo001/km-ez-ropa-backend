// 📁 backend/middleware/adminOnly.js
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';
import { enviarError } from '../utils/admin-auth-utils.js';

/**
 * 🔐 Middleware: Solo permite acceso a usuarios con rol "admin"
 */
const adminOnly = (req, res, next) => {
  try {
    const { user } = req;

    // 🔍 Validar existencia del usuario autenticado
    if (!user || typeof user !== 'object') {
      logger.warn(`❌ Acceso anónimo o sin user válido | IP: ${req.ip} | Ruta: ${req.method} ${req.originalUrl}`);
      return enviarError(res, '🚫 Debes iniciar sesión como administrador.', 401);
    }

    const role = String(user.role || '').trim().toLowerCase();
    const userId = user._id || user.id || 'sin-ID';

    // ⛔ Rechazar si el rol no es admin
    if (role !== 'admin') {
      logger.warn(`⛔ Acceso no autorizado | Usuario: ${userId} | Rol: ${role} | IP: ${req.ip}`);
      return enviarError(res, '⛔ Acción denegada. Solo administradores pueden acceder.', 403);
    }

    // ✅ Autorización concedida
    logger.info(`✅ Admin autorizado: ${user.username || user.email || userId} | Ruta: ${req.method} ${req.originalUrl}`);
    next();
  } catch (err) {
    logger.error('❌ Error inesperado en adminOnly:', err);
    return enviarError(
      res,
      '❌ Error interno al validar permisos de administrador.',
      500,
      config.env !== 'production' ? err.message : undefined
    );
  }
};

export default adminOnly;
