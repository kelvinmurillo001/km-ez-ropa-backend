const express = require('express');
const router = express.Router();

const {
  registrarVisita,
  obtenerVisitas
} = require('../controllers/visitController');

// POST /api/visitas/registrar
router.post('/registrar', registrarVisita);

// GET /api/visitas
router.get('/', obtenerVisitas);

module.exports = router;
