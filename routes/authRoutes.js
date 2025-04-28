// 📁 backend/routes/authRoutes.js
import express from 'express'
import { loginAdmin } from '../controllers/authController.js'
import { refreshToken } from '../controllers/refreshTokenController.js'
import { loginValidation } from '../validators/authValidator.js'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 🛡️ RUTAS DE AUTENTICACIÓN                                                  */
/* -------------------------------------------------------------------------- */

/**
 * 🎫 POST /api/auth/login
 * Inicia sesión como administrador
 */
router.post('/login', loginValidation, loginAdmin)

/**
 * 🔄 POST /api/auth/refresh
 * Solicita nuevo accessToken usando refreshToken
 */
router.post('/refresh', refreshToken)

export default router
