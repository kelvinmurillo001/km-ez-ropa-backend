// 📁 backend/config/rateLimiter.js
// 🎯 Middleware de Express para limitar solicitudes por IP y mitigar abusos

import rateLimit from 'express-rate-limit';
import config from './configuracionesito.js';
import logger from '../utils/logger.js';

// 🔒 Limita el número de solicitudes por IP por ventana de tiempo
const limiter = rateLimit({
  windowMs: (config.rateLimitWindow || 5) * 60 * 1000, // ⏱️ Ventana de tiempo en ms (por defecto 5 min)
  max: config.rateLimitMax || 100, // 🔢 Máximo de peticiones por IP
  message: {
    status: 429,
    message: '⚠️ Demasiadas solicitudes. Intenta nuevamente en unos minutos.'
  },
  standardHeaders: true, // 📋 Añade headers estándar RateLimit-Limit, etc.
  legacyHeaders: false,  // ❌ Desactiva encabezados antiguos X-RateLimit-*
  skipSuccessfulRequests: false, // 🔄 Cuenta todas las peticiones (incluso exitosas)

  // 📈 Log personalizado cuando se supera el límite
  handler: (req, res, next, options) => {
    logger.warn(`🚨 Rate limit excedido: ${req.ip} - ${req.method} ${req.originalUrl}`);
    res.status(options.statusCode).json(options.message);
  }
});

// 🧪 Log de configuración en entorno de desarrollo
if (config.env !== 'production') {
  logger.info(`🛡️ Rate limiter activo: ${config.rateLimitMax} reqs / ${config.rateLimitWindow} min por IP`);
}

export default limiter;
