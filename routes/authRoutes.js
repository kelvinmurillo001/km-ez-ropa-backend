const express = require('express');
const router = express.Router();

const { loginAdmin } = require('../controllers/authController');

// 🔐 Autenticación de administrador (login)
router.post('/login', loginAdmin);

module.exports = router;
