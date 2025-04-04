const express = require('express');
const router = express.Router();

const {
  registrarVisita,
  obtenerVisitas
} = require('../controllers/visitController');

// 📈 Registrar una visita (pública, sin auth)
router.post('/registrar', registrarVisita);

// 📊 Obtener total acumulado de visitas
router.get('/', obtenerVisitas);

module.exports = router;
