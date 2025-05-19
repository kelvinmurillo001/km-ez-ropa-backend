// 📁 backend/config/slowdown.js
// 🎯 Middleware para ralentizar respuestas tras demasiadas solicitudes rápidas

import slowDown from 'express-slow-down';
import config from './configuracionesito.js';
import logger from '../utils/logger.js';

// ⚙️ Configuración del middleware slowdown
const slow = slowDown({
  windowMs: (config.rateLimitWindow || 5) * 60 * 1000, // ⏱️ Duración de ventana (en milisegundos)
  delayAfter: 20, // 🧮 Número de solicitudes permitidas antes de empezar a ralentizar
  delayMs: (req, res) => {
    logger.warn(`🐢 Ralentizando respuesta para IP: ${req.ip} - ${req.method} ${req.originalUrl}`);
    return 500; // ⏳ Cada solicitud adicional se retrasa 500ms
  }
});

// 🧪 Log de configuración en entorno de desarrollo
if (config.env !== 'production') {
  logger.info(`⏳ Slowdown activo: después de 20 solicitudes por IP cada ${config.rateLimitWindow} min`);
}

export default slow;
