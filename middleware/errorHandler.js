// 📁 backend/middleware/errorHandler.js

/**
 * ❌ Middleware de manejo global de errores
 * - Provee respuestas uniformes
 * - Oculta detalles en producción
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development'
  const statusCode = err.statusCode && Number(err.statusCode) < 600 ? err.statusCode : 500
  const message = err.message || '❌ Error interno del servidor'

  // 🪵 Log sólo en desarrollo
  if (isDev) {
    console.error('❌ Error detectado:', {
      ruta: `${req.method} ${req.originalUrl}`,
      mensaje: message,
      stack: err.stack
    })
  }

  res.status(statusCode).json({
    ok: false,
    message,
    ...(isDev && { error: err.stack })
  })
}

export default errorHandler
