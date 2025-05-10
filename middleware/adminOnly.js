// 📁 backend/middleware/adminOnly.js
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * 🔐 Middleware: Restringe acceso solo a usuarios con rol "admin"
 */
const adminOnly = (req, res, next) => {
  try {
    const user = req.user;

    // 🚫 Usuario no autenticado o mal inyectado por middleware previo
    if (!user || typeof user !== 'object' || !user.role) {
      logger.warn(`❌ Acceso anónimo o sin usuario válido desde IP: ${req.ip}`);
      return res.status(401).json({
        ok: false,
        message: '🚫 Acceso denegado. Inicia sesión como administrador.'
      });
    }

    const role = String(user.role || '').trim().toLowerCase();

    if (role !== 'admin') {
      logger.warn(`⛔ Usuario sin permisos: ${user._id} (rol: ${role}) - IP: ${req.ip}`);
      return res.status(403).json({
        ok: false,
        message: '⛔ Acción denegada. Requiere permisos de administrador.'
      });
    }

    // ✅ Permiso concedido
    next();
  } catch (err) {
    logger.error('❌ Error en adminOnly middleware:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al validar rol de administrador.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

export default adminOnly;
