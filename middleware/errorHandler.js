// 📁 backend/middleware/errorHandler.js
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

/**
 * ❌ Middleware de manejo global de errores
 * - Unifica respuestas
 * - Oculta detalles sensibles en producción
 * - Log profesional para trazabilidad
 */
const errorHandler = (err, req, res, next) => {
  const isDev = config.env !== 'production';

  // 📦 Código de estado HTTP seguro
  const status = Number.isInteger(err.statusCode) && err.statusCode >= 100 && err.statusCode < 600
    ? err.statusCode
    : 500;

  // 📋 Mensaje legible o por defecto
  const message = typeof err.message === 'string' && err.message.length < 400
    ? err.message
    : '❌ Error interno del servidor';

  // ⚠️ Evitar doble respuesta
  if (res.headersSent) {
    logger.warn('⚠️ Headers ya enviados. No se puede reenviar error.');
    return next(err);
  }

  // 🧾 Log extendido
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    status,
    userId: req.user?.id || 'Anon',
    code: err.code || 'N/A',
    name: err.name || 'Error',
    ...(isDev && { stack: err.stack || 'No stack' })
  };

  logger.error(`💥 [${status}] ${req.method} ${req.originalUrl} - ${message}`, logData);

  // 📤 Estructura de respuesta unificada
  const response = {
    ok: false,
    message: status === 500 ? '❌ Error interno. Intenta más tarde.' : message,
    ...(err.code && { errorCode: err.code }),
    ...(isDev && err.stack && {
      stack: err.stack.split('\n').slice(0, 5).join('\n') // solo primeras 5 líneas
    })
  };

  return res.status(status).json(response);
};

export default errorHandler;
