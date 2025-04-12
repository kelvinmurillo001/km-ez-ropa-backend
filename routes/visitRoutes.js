const express = require('express');
const router = express.Router();

const {
  registrarVisita,
  obtenerVisitas
} = require('../controllers/visitController');

const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

/**
 * 📈 Registrar una visita (PÚBLICO)
 * POST /api/visitas/registrar
 */
router.post('/registrar', registrarVisita);

/**
 * 📊 Obtener total de visitas (SOLO ADMIN)
 * GET /api/visitas
 */
router.get('/', authMiddleware, adminOnly, obtenerVisitas);

module.exports = router;
