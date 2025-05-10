// 📁 backend/middleware/clientOnly.js

import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';
import { enviarError } from '../utils/admin-auth-utils.js';

/**
 * 🔐 Middleware: Solo usuarios con rol "client"
 */
const clientOnly = (req, res, next) => {
  try {
    const user = req.user;

    // 🛑 No autenticado
    if (!user || typeof user !== 'object') {
      logger.warn(`❌ Usuario no autenticado (se requiere cliente) - IP: ${req.ip}`);
      return enviarError(res, '🔒 Debes iniciar sesión como cliente.', 401);
    }

    const role = String(user.role || '').trim().toLowerCase();

    if (role !== 'client') {
      logger.warn(`⛔ Acceso denegado. Usuario: ${user._id || '¿sin ID?'} con rol: ${role} - IP: ${req.ip}`);
      return enviarError(res, '⛔ Solo los clientes pueden acceder a esta ruta.', 403);
    }

    // ✅ Autorizado
    next();
  } catch (err) {
    logger.error('❌ Error en clientOnly middleware:', err);
    return enviarError(
      res,
      '❌ Error interno al validar acceso de cliente.',
      500,
      config.env !== 'production' ? err.message : undefined
    );
  }
};

export default clientOnly;
