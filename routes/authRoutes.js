const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { loginAdmin } = require('../controllers/authController');

// 🔐 Login solo para administradores
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
  ],
  loginAdmin
);

module.exports = router;
