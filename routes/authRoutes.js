// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { loginAdmin } = require('../controllers/authController');

// 🔐 Login solo para administradores
router.post(
  '/login',
  [
    body('username')
      .trim()
      .notEmpty().withMessage('El nombre de usuario es obligatorio')
      .isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres'),

    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria')
      .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  loginAdmin
);

module.exports = router;
