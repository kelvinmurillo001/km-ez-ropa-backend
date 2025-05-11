// 📁 backend/middleware/errorHandler.js
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

/**
 * ❌ Middleware de manejo global de errores
 * - Unifica respuestas de error
 * - Oculta detalles sensibles en producción
 * - Registra actividad útil para trazabilidad
 */
const errorHandler = (err, req, res, next) => {
  const isDev = config.env !== 'production';

  // ✅ Determinar estado HTTP seguro
  const status = Number.isInteger(err.statusCode) && err.statusCode >= 100 && err.statusCode < 600
    ? err.statusCode
    : 500;

  // ✅ Mensaje legible
  const message = typeof err.message === 'string' && err.message.length < 400
    ? err.message
    : '❌ Error interno del servidor';

  // ✅ Evitar doble respuesta
  if (res.headersSent) {
    logger.warn('⚠️ Intento de enviar error cuando los headers ya fueron enviados.');
    return next(err);
  }

  // ✅ Registro del error (log extendido en desarrollo)
  const logContext = {
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id || 'Anon',
    status,
    name: err.name || 'Error',
    code: err.code || 'N/A',
    stack: err.stack || 'No stack'
  };

  logger.error(`💥 [${status}] ${req.method} ${req.originalUrl} - ${message}`, isDev ? logContext : {
    method: req.method,
    url: req.originalUrl,
    status,
    code: err.code || 'N/A'
  });

  // ✅ Estructura de respuesta clara
  const response = {
    ok: false,
    message: status === 500 ? '❌ Error interno. Intenta más tarde.' : message,
    ...(err.code && { errorCode: err.code }),
    ...(isDev && err.stack && { stack: err.stack.split('\n').slice(0, 5).join('\n') })
  };

  return res.status(status).json(response);
};

export default errorHandler;
