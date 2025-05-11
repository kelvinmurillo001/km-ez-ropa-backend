// 📁 backend/middleware/validarErrores.js
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * 🚦 Middleware: Centraliza manejo de errores de validación (express-validator)
 * - Filtra errores sin campo
 * - Respuesta uniforme
 * - Log detallado en desarrollo
 */
const validarErrores = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errores = result.array().filter(err => err?.param && err?.msg);

    // 🧪 Logging detallado (solo dev)
    if (config.env === 'development') {
      logger.warn('❌ Validación fallida:', {
        ruta: req.originalUrl,
        metodo: req.method,
        ip: req.ip,
        errores
      });
    }

    return res.status(400).json({
      ok: false,
      message: '❌ Datos inválidos en la solicitud.',
      errors: errores.map(({ param, msg }) => ({
        field: param,
        message: msg
      }))
    });
  }

  next();
};

export default validarErrores;
