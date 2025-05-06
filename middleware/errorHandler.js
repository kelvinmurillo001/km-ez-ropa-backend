// 📁 backend/middleware/errorHandler.js
import config from '../config/configuracionesito.js'
import logger from '../utils/logger.js'

/**
 * ❌ Middleware de manejo global de errores
 * - Provee respuestas uniformes
 * - Oculta detalles sensibles en producción
 */
const errorHandler = (err, req, res, next) => {
  const isDev = config.env === 'development'

  // 🛡️ Código de estado HTTP seguro
  const status = Number.isInteger(err.statusCode) && err.statusCode >= 100 && err.statusCode < 600
    ? err.statusCode
    : 500

  // 📩 Mensaje seguro para el cliente
  const message = typeof err.message === 'string'
    ? err.message
    : '❌ Error interno del servidor'

  // 🧠 Log detallado según entorno
  const logDetails = {
    method: req.method,
    url: req.originalUrl,
    status,
    name: err.name,
    code: err.code || 'N/A',
    stack: err.stack
  }

  if (isDev) {
    logger.error(`🛠️ [DEV] Error en ${req.method} ${req.originalUrl}: ${message}`, logDetails)
  } else {
    logger.error(`🔥 Error en producción: ${req.method} ${req.originalUrl} - ${message}`)
  }

  // 📤 Respuesta estructurada
  const response = {
    ok: false,
    message
  }

  if (err.code) {
    response.errorCode = err.code
  }

  if (isDev && err.stack) {
    response.stack = err.stack
  }

  return res.status(status).json(response)
}

export default errorHandler
