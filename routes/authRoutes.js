// 📁 backend/routes/authRoutes.js
import express from 'express'
import passport from 'passport'

// 🎯 Controladores
import { loginAdmin } from '../controllers/authController.js'
import { refreshTokenController } from '../controllers/refreshTokenController.js'

// ✅ Validaciones
import { loginValidation } from '../validators/authValidator.js'
import validarErrores from '../middleware/validarErrores.js'

// 🔐 Estrategias Passport
import '../config/passport.js'

// 🚀 Router de Express
const router = express.Router()

/* ───────────────────────────────────────────── */
/* 🔐 RUTAS DE AUTENTICACIÓN PARA ADMIN Y GOOGLE */
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

/**
 * 🌐 GET /api/auth/google
 * ➤ Iniciar autenticación con Google
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

/**
 * 🌐 GET /api/auth/google/callback
 * ➤ Callback desde Google OAuth2
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login.html',
    session: true
  }),
  (req, res) => {
    // ✅ Redirigir según rol del usuario
    if (!req.user) return res.redirect('/login.html')
    if (req.user.role === 'admin') {
      return res.redirect('/admin/dashboard.html')
    }
    return res.redirect('/categorias.html')
  }
)

export default router
