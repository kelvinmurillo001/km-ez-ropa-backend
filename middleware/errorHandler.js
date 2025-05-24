// 📁 backend/middleware/errorHandler.js
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

/**
 * ❌ Middleware global para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  const isDev = config.env !== 'production';

  const status =
    Number.isInteger(err.statusCode) && err.statusCode >= 100 && err.statusCode < 600
      ? err.statusCode
      : Number.isInteger(err.status) && err.status >= 100 && err.status < 600
      ? err.status
      : 500;

  const message =
    typeof err.message === 'string' && err.message.trim().length > 1 && err.message.length < 400
      ? err.message
      : '❌ Error interno del servidor';

  if (res.headersSent) {
    logger.warn('⚠️ Headers ya enviados. No se puede reenviar error.');
    return next(err);
  }

  const logInfo = {
    metodo: req.method,
    ruta: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || req.user?._id || 'Desconocido',
    status,
    errorCode: err.code || 'N/A',
    errorName: err.name || 'Error',
    ...(isDev && { stack: err.stack || 'No stack trace' }),
  };

  logger.error(`💥 [${status}] ${req.method} ${req.originalUrl} - ${message}`, logInfo);

  const responseBody = {
    ok: false,
    message: status === 500 ? '❌ Error interno. Intenta más tarde.' : message,
    ...(err.code && typeof err.code === 'string' && { errorCode: err.code }),
    ...(isDev && err.stack && {
      stack: err.stack.split('\n').slice(0, 5).join('\n')
    }),
  };

  res.status(status).json(responseBody);
};

export default errorHandler;
