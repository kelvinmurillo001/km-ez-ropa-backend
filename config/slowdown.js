// 📁 backend/config/slowdown.js
// 🎯 Middleware para ralentizar respuestas tras demasiadas solicitudes rápidas

import slowDown from 'express-slow-down';

// ⚙️ Configurar ralentización
const slow = slowDown({
  windowMs: 5 * 60 * 1000, // ⏱️ Ventana de 5 minutos
  delayAfter: 20,          // 🧮 Después de 20 solicitudes, empezar a ralentizar
  delayMs: 500             // 🐢 Añadir 0.5 segundos de retraso por cada solicitud adicional
});

// 🚀 Exportar middleware configurado
export default slow;
