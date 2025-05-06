// 📁 backend/routes/authRoutes.js
import express from 'express'

// 🎯 Controladores
import { loginAdmin } from '../controllers/authController.js'
import { refreshTokenController } from '../controllers/refreshTokenController.js'

// ✅ Middlewares de validación
import { loginValidation } from '../validators/authValidator.js'

// 🚀 Router de Express
const router = express.Router()

/* ───────────────────────────────────────────── */
/* 🔐 RUTAS DE AUTENTICACIÓN                     */
/* ───────────────────────────────────────────── */

/**
 * 🎫 POST /api/auth/login
 * 👉 Inicio de sesión para administradores.
 *    Se espera username y password en el cuerpo.
 *    Retorna accessToken y configura refreshToken como cookie segura.
 */
router.post('/login', loginValidation, loginAdmin)

/**
 * 🔄 POST /api/auth/refresh
 * 👉 Solicita nuevo accessToken usando refreshToken presente en cookie.
 *    Solo válido si el refreshToken aún está activo.
 */
router.post('/refresh', refreshTokenController)

export default router
