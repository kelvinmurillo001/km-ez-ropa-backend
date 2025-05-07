import rateLimit from 'express-rate-limit'

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // máx 30 requests por IP
  message: {
    ok: false,
    message: '⚠️ Demasiadas solicitudes. Intenta nuevamente en unos minutos.'
  }
})
