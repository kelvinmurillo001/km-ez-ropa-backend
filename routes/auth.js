// 📁 backend/routes/auth.js
import express from 'express'
import passport from 'passport'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 🔐 AUTENTICACIÓN CON GOOGLE                                                */
/* -------------------------------------------------------------------------- */

/**
 * 🎯 Iniciar login con Google
 * Redirige a la pantalla de consentimiento de Google.
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

/**
 * ✅ Callback después de la autenticación con Google
 * Redirige según el rol del usuario autenticado.
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    failureMessage: true
  }),
  (req, res) => {
    const role = req.user?.role || 'client'
    const redirectUrl =
      role === 'admin'
        ? 'https://kmezropacatalogo.com/admin'
        : 'https://kmezropacatalogo.com/cliente'

    return res.redirect(redirectUrl)
  }
)

/**
 * 👤 Obtener el usuario autenticado (sesión activa)
 */
router.get('/me', (req, res) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({
      ok: false,
      message: '🔒 Usuario no autenticado'
    })
  }

  res.status(200).json({
    ok: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  })
})

/**
 * 🚪 Cerrar sesión y limpiar cookies
 */
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error('❌ Error al cerrar sesión:', err)
      return res.status(500).json({ ok: false, message: '❌ Error al cerrar sesión' })
    }

    req.session?.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' })
      return res.status(200).json({ ok: true, message: '✅ Sesión cerrada correctamente' })
    })
  })
})

export default router
