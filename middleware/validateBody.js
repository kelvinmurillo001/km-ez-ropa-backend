// 📁 backend/middleware/validateBody.js
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * ✅ Middleware global:
 * Valida que el body sea un JSON válido solo si es requerido
 */
export default function validarBodyGlobal(req, res, next) {
  const methodsConBody = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const isJsonRequest = req.is('application/json');

  if (
    methodsConBody.includes(req.method.toUpperCase()) &&
    isJsonRequest &&
    (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))
  ) {
    const mensaje = `❌ Body JSON inválido en ${req.method} ${req.originalUrl}`;

    if (config.env !== 'production') {
      logger.warn(mensaje, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        headers: req.headers['content-type'],
      });
    }

    return res.status(400).json({
      ok: false,
      status: 400,
      message: '❌ El cuerpo de la petición debe ser un JSON válido (objeto no vacío).',
    });
  }

  next();
}
