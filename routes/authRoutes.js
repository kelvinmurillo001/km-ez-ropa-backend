const express = require('express');
const router = express.Router();

const { loginAdmin } = require('../controllers/authController');

// 🔐 Ruta para iniciar sesión del administrador
router.post('/login', loginAdmin);

module.exports = router;
