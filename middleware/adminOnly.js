// 📁 backend/middleware/adminOnly.js
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';
import { enviarError } from '../utils/admin-auth-utils.js';

/**
 * 🔐 Middleware: Restringe el acceso a usuarios con rol "admin".
 */
const adminOnly = (req, res, next) => {
  try {
    const { user, method, originalUrl, ip } = req;

    // 🚫 Usuario no autenticado
    if (!user || typeof user !== 'object') {
      logger.warn(`🚫 Acceso sin autenticación | IP: ${ip} | Ruta: ${method} ${originalUrl}`);
      return enviarError(res, '🚫 Debes iniciar sesión como administrador.', 401);
    }

    const role = String(user.role || '').trim().toLowerCase();
    const userId = user._id || user.id || 'sin-ID';

    // ⛔ Usuario sin permisos de administrador
    if (role !== 'admin') {
      logger.warn(`⛔ Rol no autorizado | Usuario: ${userId} | Rol: ${role} | IP: ${ip}`);
      return enviarError(res, '⛔ Acción denegada. Solo administradores pueden acceder.', 403);
    }

    // ✅ Acceso autorizado
    logger.info(`✅ Acceso admin concedido | ${user.username || user.email || userId} | Ruta: ${method} ${originalUrl}`);
    return next();
  } catch (err) {
    logger.error(`❌ Error inesperado en adminOnly | Ruta: ${req.method} ${req.originalUrl}`, err);
    return enviarError(
      res,
      '❌ Error interno al validar permisos de administrador.',
      500,
      config.env !== 'production' ? err.message : undefined
    );
  }
};

export default adminOnly;
