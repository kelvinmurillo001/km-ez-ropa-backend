const express = require('express');
const router = express.Router();

const {
  registrarVisita,
  obtenerVisitas
} = require('../controllers/visitController');

const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// 📈 Registrar visita (pública)
router.post('/registrar', registrarVisita);

// 📊 Obtener visitas (solo admin)
router.get('/', authMiddleware, adminOnly, obtenerVisitas);

module.exports = router;
