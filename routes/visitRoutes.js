const express = require('express');
const router = express.Router();

// 🧾 Controladores
const {
  registrarVisita,
  obtenerVisitas
} = require('../controllers/visitController');

// 🛡️ Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

/* -------------------------------------------------------------------------- */
/* 📈 RUTAS DE VISITAS                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 📌 Registrar una nueva visita (PÚBLICO)
 * POST /api/visitas/registrar
 * - Ruta pública sin autenticación
 */
router.post('/registrar', (req, res, next) => {
  // 🧯 Opcional: bloquear bots comunes o abuse headers
  const userAgent = req.headers['user-agent'] || '';
  if (/curl|postman|bot|crawler/i.test(userAgent)) {
    return res.status(403).json({ message: '🚫 Acceso automatizado denegado' });
  }
  next();
}, registrarVisita);

/**
 * 📊 Obtener total de visitas acumuladas (SOLO ADMIN)
 * GET /api/visitas
 */
router.get('/', authMiddleware, adminOnly, obtenerVisitas);

module.exports = router;
