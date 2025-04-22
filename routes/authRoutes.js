const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { loginAdmin } = require('../controllers/authController')

/* -------------------------------------------------------------------------- */
/* 🔐 RUTA DE AUTENTICACIÓN ADMINISTRADOR                                     */
/* -------------------------------------------------------------------------- */

/**
 * 🎫 POST /api/auth/login
 * Inicia sesión como administrador
 *
 * ✅ Validaciones:
 * - username obligatorio (mínimo 3 caracteres)
 * - password obligatorio (mínimo 6 caracteres)
 */
router.post(
  '/login',
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('⚠️ El nombre de usuario es obligatorio')
      .isLength({ min: 3 })
      .withMessage('⚠️ Mínimo 3 caracteres en el nombre de usuario')
      .escape(), // 🔐 Sanitiza HTML/script

    body('password')
      .trim()
      .notEmpty()
      .withMessage('⚠️ La contraseña es obligatoria')
      .isLength({ min: 6 })
      .withMessage('⚠️ Mínimo 6 caracteres en la contraseña')
      .escape() // 🔐 Sanitiza para evitar inyecciones
  ],
  loginAdmin
)

// 🚀 Futuras rutas podrían ir aquí:
// router.post('/logout', ...);
// router.get('/me', authMiddleware, ...);

module.exports = router
