// 📁 backend/routes/authRoutes.js
import express from 'express'

// 🎯 Controladores
import { loginAdmin } from '../controllers/authController.js'
import { refreshTokenController } from '../controllers/refreshTokenController.js'

// ✅ Validaciones
import { loginValidation } from '../validators/authValidator.js'
import validarErrores from '../middleware/validarErrores.js'

// 🚀 Router de Express
const router = express.Router()

/* ───────────────────────────────────────────── */
/* 🔐 RUTAS DE AUTENTICACIÓN PARA ADMIN          */
/* ───────────────────────────────────────────── */

/**
 * 🎫 POST /api/auth/login
 * ➤ Iniciar sesión (solo admins)
 */
router.post(
  '/login',
  loginValidation,
  validarErrores,
  loginAdmin
)

/**
 * 🔄 POST /api/auth/refresh
 * ➤ Renovar accessToken usando refreshToken (cookie HTTP-only)
 */
router.post(
  '/refresh',
  refreshTokenController
)

export default router
