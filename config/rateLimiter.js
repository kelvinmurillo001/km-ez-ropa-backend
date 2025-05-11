// 📁 backend/config/rateLimiter.js
// 🎯 Middleware de Express para limitar solicitudes por IP y mitigar abusos

import rateLimit from 'express-rate-limit';
import config from './configuracionesito.js';
import logger from '../utils/logger.js';

// 🔒 Limita el número de solicitudes por IP por ventana de tiempo
const limiter = rateLimit({
  windowMs: (config.rateLimitWindow || 5) * 60 * 1000, // ⏱️ 5 minutos por defecto
  max: config.rateLimitMax || 100, // 🔢 Máximo de peticiones permitidas
  message: {
    status: 429,
    message: '⚠️ Demasiadas solicitudes. Intenta nuevamente en unos minutos.',
  },
  standardHeaders: true, // 📋 Añade headers modernos como RateLimit-Limit
  legacyHeaders: false, // ❌ Desactiva encabezados antiguos X-RateLimit-*

  // 📈 Log si se excede el límite
  handler: (req, res, next, options) => {
    logger.warn(`🚨 Rate limit excedido: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },

  skipSuccessfulRequests: false // 👉 También cuenta las exitosas (ajustable)
});

// 🔍 Debug opcional en entorno desarrollo
if (config.env !== 'production') {
  logger.info(`🛡️ Rate limiter activo: ${config.rateLimitMax} reqs / ${config.rateLimitWindow} min por IP`);
}

export default limiter;
