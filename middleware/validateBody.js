// 📁 backend/middleware/validateBody.js
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * ✅ Middleware global:
 * Valida que el body sea un JSON válido si el Content-Type es application/json
 */
export default function validarBodyGlobal(req, res, next) {
  const isJson = req.is('application/json');

  if (isJson && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
    const mensaje = `❌ Body JSON inválido recibido en ${req.method} ${req.originalUrl}`;

    if (config.env !== 'production') {
      logger.warn(mensaje);
    }

    return res.status(400).json({
      ok: false,
      status: 400,
      message: '❌ El cuerpo de la petición debe ser un JSON válido (objeto).',
    });
  }

  next();
}
