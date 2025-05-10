// 📁 backend/middleware/validarErrores.js
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * 🚦 Middleware: Centraliza manejo de errores de validación de express-validator
 */
const validarErrores = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errores = result.array().filter(e => e.param && e.msg);

    // 🪵 Logging en desarrollo con contexto
    if (config.env === 'development') {
      logger.warn(`🧪 Validación fallida en ${req.method} ${req.originalUrl}`, errores);
    }

    return res.status(400).json({
      ok: false,
      message: '❌ Datos inválidos en la solicitud.',
      errors: errores.map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }

  return next();
};

export default validarErrores;
