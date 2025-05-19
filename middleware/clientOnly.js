// 📁 backend/middleware/clientOnly.js
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';
import { enviarError } from '../utils/admin-auth-utils.js';

/**
 * 🔐 Middleware: Solo permite acceso a usuarios con rol "client"
 */
const clientOnly = (req, res, next) => {
  try {
    const { user } = req;

    if (!user || typeof user !== 'object') {
      logger.warn(`❌ Acceso anónimo o user object inválido | IP: ${req.ip} | ${req.method} ${req.originalUrl}`);
      return enviarError(res, '🔒 Debes iniciar sesión como cliente.', 401);
    }

    const role = String(user.role || '').trim().toLowerCase();
    const userId = user._id || user.id || 'sin-ID';

    if (role !== 'client') {
      logger.warn(`⛔ Acceso denegado | Usuario: ${userId} | Rol: ${role} | IP: ${req.ip}`);
      return enviarError(res, '⛔ Solo los clientes pueden acceder a esta ruta.', 403);
    }

    logger.info(`✅ Cliente autorizado: ${user.username || user.email || userId} | ${req.method} ${req.originalUrl}`);
    next();
  } catch (err) {
    logger.error('❌ Error inesperado en clientOnly:', err);
    return enviarError(
      res,
      '❌ Error interno al validar acceso de cliente.',
      500,
      config.env !== 'production' ? err.message : undefined
    );
  }
};

export default clientOnly;
