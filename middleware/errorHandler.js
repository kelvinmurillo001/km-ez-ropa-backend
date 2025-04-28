// 📁 backend/middleware/errorHandler.js

/**
 * ❌ Middleware de manejo global de errores
 * - Provee respuestas uniformes
 * - Oculta detalles sensibles en producción
 */
const errorHandler = (err, req, res, next) => {
  const { NODE_ENV } = process.env
  const isDev = NODE_ENV === 'development'

  const statusCode = err.statusCode && Number(err.statusCode) < 600 ? err.statusCode : 500
  const message = err.message || '❌ Error interno del servidor'

  // 🪵 Log de error detallado solo en modo desarrollo
  if (isDev) {
    console.error('❌ Error detectado:', {
      ruta: `${req?.method || 'N/A'} ${req?.originalUrl || 'N/A'}`,
      mensaje: message,
      stack: err.stack
    })
  }

  // 📤 Respuesta unificada
  res.status(statusCode).json({
    ok: false,
    message,
    ...(isDev && { error: err.stack }) // En dev, incluir el stack
  })
}

export default errorHandler
