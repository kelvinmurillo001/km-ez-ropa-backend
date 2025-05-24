import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * 🚦 Middleware: Manejo centralizado de errores de validación (express-validator)
 */
function validarErrores(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const erroresFiltrados = result.array().filter(err => err?.param && err?.msg);

    if (config.env !== 'production') {
      logger.warn('❌ Validación fallida', {
        ruta: req.originalUrl,
        metodo: req.method,
        ip: req.ip,
        errores: erroresFiltrados,
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? truncateBody(req.body) : undefined
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

  return next();
}

// 🧹 Evita mostrar cuerpos de petición gigantes en el log
function truncateBody(body = {}, maxLength = 300) {
  const json = JSON.stringify(body);
  return json.length > maxLength ? json.substring(0, maxLength) + '...' : json;
}

export default validarErrores;
