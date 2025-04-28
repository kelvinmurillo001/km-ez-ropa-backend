// 📁 backend/config/rateLimiter.js
// 🎯 Middleware de Express para limitar solicitudes por IP

import rateLimit from 'express-rate-limit';

// ⚙️ Configurar límites de solicitud
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // ⏱️ Ventana de 5 minutos
  max: 100,                // 🔢 Máximo 100 solicitudes por IP
  message: '⚠️ Demasiadas solicitudes. Intenta más tarde.',
  standardHeaders: true,   // 📋 Usa headers modernos (RateLimit-* headers)
  legacyHeaders: false     // ❌ Desactiva X-RateLimit-* antiguos
});

// 🚀 Exportar para usar en app principal
export default limiter;
