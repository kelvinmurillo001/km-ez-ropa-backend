const express = require('express');
const router = express.Router();

// 🧾 Controladores
const {
  registrarVisita,
  obtenerVisitas
} = require('../controllers/visitController');

// 🛡️ Seguridad
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

/* -------------------------------------------------------------------------- */
/* 📈 RUTAS DE VISITAS                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 📌 Registrar una nueva visita (PÚBLICO)
 * POST /api/visitas/registrar
 */
router.post('/registrar', registrarVisita);

/**
 * 📊 Obtener total de visitas acumuladas (SOLO ADMIN)
 * GET /api/visitas
 */
router.get('/', authMiddleware, adminOnly, obtenerVisitas);

module.exports = router;
