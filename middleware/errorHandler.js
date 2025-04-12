/**
 * ❌ Middleware centralizado de manejo de errores
 * - Captura errores no manejados en rutas o middlewares
 * - Devuelve mensaje genérico (excepto en desarrollo)
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  console.error('❌ Error:', err.stack);

  res.status(500).json({
    message: 'Error interno del servidor',
    ...(isDev && { error: err.message }) // Solo en desarrollo mostrar detalles
  });
};

module.exports = errorHandler;
