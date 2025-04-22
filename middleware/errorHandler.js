/**
 * ❌ Middleware de manejo global de errores
 * - Provee respuestas uniformes
 * - Oculta detalles en producción
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = err.statusCode && Number(err.statusCode) < 600 ? err.statusCode : 500;
  const message = err.message || '❌ Error interno del servidor';

  // 🪵 Log solo en desarrollo
  console.error('❌ Error detectado:', {
    ruta: `${req.method} ${req.originalUrl}`,
    mensaje: message,
    stack: isDev ? err.stack : '🔒 Oculto en producción'
  });

  return res.status(statusCode).json({
    ok: false,
    message,
    ...(isDev && { error: err.stack })
  });
};

module.exports = errorHandler;
