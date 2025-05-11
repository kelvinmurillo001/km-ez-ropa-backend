// 📁 backend/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * 🛡️ Limita la cantidad de solicitudes por IP para rutas sensibles (ej. /api/auth)
 */

// 💡 Opciones personalizadas
const limiterOptions = {
  windowMs: config.rateLimitWindow * 60 * 1000 || 15 * 60 * 1000, // en minutos (fallback 15 min)
  max: config.rateLimitMax || 30, // fallback: 30 req por ventana
  standardHeaders: true, // muestra headers de límite
  legacyHeaders: false,
  handler: (req, res, _next) => {
    logger.warn(`🚫 Límite alcanzado desde IP: ${req.ip} - ${req.originalUrl}`);
    res.status(429).json({
      ok: false,
      message: '⚠️ Demasiadas solicitudes. Intenta nuevamente en unos minutos.'
    });
  }
};

// 🛡️ Exporta limitador para rutas admin (login, dashboard, etc)
export const adminLimiter = rateLimit(limiterOptions);
