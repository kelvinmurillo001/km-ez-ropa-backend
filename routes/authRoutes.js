// 📁 backend/routes/authRoutes.js
import express from 'express'
import { body } from 'express-validator'
import { loginAdmin } from '../controllers/authController.js'

const router = express.Router()

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
      .escape(),

    body('password')
      .trim()
      .notEmpty()
      .withMessage('⚠️ La contraseña es obligatoria')
      .isLength({ min: 6 })
      .withMessage('⚠️ Mínimo 6 caracteres en la contraseña')
      .escape()
  ],
  loginAdmin
)

// 🚀 Futuras rutas podrían ir aquí
// router.post('/logout', ...);
// router.get('/me', authMiddleware, ...);

export default router
