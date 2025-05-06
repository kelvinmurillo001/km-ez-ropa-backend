// 📁 backend/middleware/validarErrores.js
import { validationResult } from 'express-validator'
import logger from '../utils/logger.js'
import config from '../config/configuracionesito.js'

/**
 * 🚦 Middleware: Centraliza manejo de errores de validación de express-validator
 */
const validarErrores = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    // 🪵 Log en modo desarrollo
    if (config.env === 'development') {
      logger.warn('🧪 Errores de validación detectados:', errors.array())
    }

    return res.status(400).json({
      ok: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    })
  }

  next()
}

export default validarErrores
