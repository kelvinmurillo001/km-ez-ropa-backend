// 📁 config/rateLimiter.js
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // ⏱️ 5 minutos
  max: 100, // 🔢 Límite de 100 solicitudes por IP
  message: '⚠️ Demasiadas solicitudes. Intenta más tarde.',
  standardHeaders: true, // Devuelve info en headers modernos
  legacyHeaders: false // Desactiva headers antiguos
})

export default limiter
