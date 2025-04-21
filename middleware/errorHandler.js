/**
 * ❌ Middleware centralizado de manejo de errores
 * - Captura errores no manejados en rutas o middlewares
 * - Devuelve mensaje genérico (excepto en desarrollo)
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = err.statusCode || 500;

  console.error('❌ Error:', {
    mensaje: err.message,
    ruta: `${req.method} ${req.originalUrl}`,
    stack: isDev ? err.stack : '🔒 Oculto en producción'
  });

  res.status(statusCode).json({
    ok: false,
    message: err.message || '❌ Error interno del servidor',
    ...(isDev && { error: err.stack })
  });
};

module.exports = errorHandler;
