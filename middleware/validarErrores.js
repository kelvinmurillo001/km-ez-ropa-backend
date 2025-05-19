// 📁 backend/middleware/validarErrores.js
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * 🚦 Middleware: Manejo centralizado de errores de validación
 * - Usa express-validator
 * - Log en desarrollo
 * - Respuesta uniforme para frontend
 */
const validarErrores = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const erroresFiltrados = result.array().filter(err => err?.param && err?.msg);

    if (config.env === 'development') {
      logger.warn('❌ Validación fallida:', {
        ruta: req.originalUrl,
        metodo: req.method,
        ip: req.ip,
        errores: erroresFiltrados
      });
    }

    return res.status(400).json({
      ok: false,
      message: '❌ Datos inválidos en la solicitud.',
      errors: erroresFiltrados.map(({ param, msg }) => ({
        field: param,
        message: msg
      }))
    });
  }

  next();
};

export default validarErrores;
