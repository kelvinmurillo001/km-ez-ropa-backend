// 📁 backend/middleware/validateBody.js
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * ✅ Middleware: Valida que el cuerpo sea un JSON válido
 * - Solo aplica si el Content-Type es application/json
 */
export default function validarBodyGlobal(req, res, next) {
  const isJson = req.is('application/json');

  if (isJson && req.body && typeof req.body !== 'object') {
    if (config.env === 'development') {
      logger.warn(`❌ JSON inválido recibido en ${req.method} ${req.originalUrl}`);
    }

    return res.status(400).json({
      ok: false,
      message: '❌ El cuerpo debe ser un JSON válido.'
    });
  }

  next();
}
