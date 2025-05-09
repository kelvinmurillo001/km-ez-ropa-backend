// 📁 backend/middleware/clientOnly.js
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * 🔐 Middleware: Solo usuarios con rol "client"
 */
const clientOnly = (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      logger.warn('❌ Usuario no autenticado (cliente requerido)');
      return res.status(401).json({
        ok: false,
        message: '🔒 Debes iniciar sesión como cliente.'
      });
    }

    if ((user.role || '').toLowerCase() !== 'client') {
      logger.warn(`⛔ Rol incorrecto (${user.role}) para ruta de cliente`);
      return res.status(403).json({
        ok: false,
        message: '⛔ Solo los clientes pueden acceder a esta ruta.'
      });
    }

    return next();
  } catch (err) {
    logger.error('❌ Error en middleware clientOnly:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al validar acceso de cliente.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

export default clientOnly;
