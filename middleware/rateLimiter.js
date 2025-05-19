// 📁 backend/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';
import config from '../config/configuracionesito.js';

/**
 * 🛡️ Middleware: Limita solicitudes por IP para rutas críticas (ej: /api/auth)
 */

// 📌 Fallback de configuración segura
const windowMs = parseInt(config.rateLimitWindow, 10) * 60 * 1000 || 15 * 60 * 1000; // 15 min
const maxRequests = parseInt(config.rateLimitMax, 10) || 30;

// 🧱 Opciones del limitador
const limiterOptions = {
  windowMs,
  max: maxRequests,
  standardHeaders: true,   // RateLimit-* headers
  legacyHeaders: false,    // No X-RateLimit-* (obsoleto)
  handler: (req, res, _next) => {
    logger.warn(`🚫 Límite de rate alcanzado | IP: ${req.ip} | Ruta: ${req.originalUrl}`);
    res.status(429).json({
      ok: false,
      message: '⚠️ Demasiadas solicitudes. Intenta nuevamente en unos minutos.'
    });
  }
};

// ✅ Limitador específico para rutas críticas (ej: login admin)
export const adminLimiter = rateLimit(limiterOptions);
