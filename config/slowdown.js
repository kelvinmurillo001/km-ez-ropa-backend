// 📁 backend/config/slowdown.js
// 🎯 Middleware para ralentizar respuestas tras demasiadas solicitudes rápidas

import slowDown from 'express-slow-down';
import config from './configuracionesito.js';
import logger from '../utils/logger.js';

// ⚙️ Configurar ralentización basada en entorno
const slow = slowDown({
  windowMs: (config.rateLimitWindow || 5) * 60 * 1000, // ⏱️ Duración de ventana desde config
  delayAfter: 20, // 🧮 Comenzar a ralentizar después de 20 solicitudes
  delayMs: (req, res) => {
    logger.warn(`🐢 Ralentizando IP: ${req.ip}`);
    return 500; // ⏳ Retraso de 500 ms por solicitud extra
  }
});

// 🧪 Debug en desarrollo
if (config.env !== 'production') {
  logger.info(`⏳ Slowdown activo después de 20 solicitudes cada ${config.rateLimitWindow} min`);
}

export default slow;
