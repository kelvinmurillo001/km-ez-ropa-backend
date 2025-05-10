// 📁 backend/middleware/errorHandler.js
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

/**
 * ❌ Middleware de manejo global de errores
 * - Unifica respuestas de error
 * - Oculta detalles en producción
 * - Registra actividad para trazabilidad
 */
const errorHandler = (err, req, res, next) => {
  const isDev = config.env === 'development';

  // Estado HTTP seguro
  const status = Number.isInteger(err.statusCode) && err.statusCode >= 100 && err.statusCode < 600
    ? err.statusCode
    : 500;

  const message = typeof err.message === 'string' && err.message.length < 400
    ? err.message
    : '❌ Error interno del servidor';

  // Log detallado
  const logContext = {
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id || 'Anon',
    status,
    name: err.name || 'Error',
    code: err.code || 'N/A',
    stack: err.stack ? (isDev ? err.stack : '[hidden]') : 'No stack'
  };

  logger.error(`💥 Error ${status} en ${req.method} ${req.originalUrl}: ${message}`, logContext);

  // Evitar múltiples respuestas
  if (res.headersSent) {
    return next(err);
  }

  const response = {
    ok: false,
    message
  };

  if (err.code) response.errorCode = err.code;
  if (isDev && err.stack) response.stack = err.stack.slice(0, 1000); // Limita tamaño en dev

  return res.status(status).json(response);
};

export default errorHandler;
