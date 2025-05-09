// 📁 backend/routes/auth.js
import express from 'express'
import passport from 'passport'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 🔐 AUTENTICACIÓN CON GOOGLE                                                */
/* -------------------------------------------------------------------------- */

/**
 * 🎯 Iniciar login con Google
 * ➤ Redirige al consentimiento de Google
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account' // Fuerza selección de cuenta
  })
)

/**
 * ✅ Callback de Google
 * ➤ Si el login es exitoso, redirige según rol
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    failureMessage: true,
    session: true
  }),
  (req, res) => {
    try {
      const role = req.user?.role || 'client'

      // Redirección dinámica
      const redirectUrl =
        role === 'admin'
          ? 'https://kmezropacatalogo.com/admin'
          : 'https://kmezropacatalogo.com/cliente'

      return res.redirect(redirectUrl)
    } catch (error) {
      console.error('❌ Error en redirección post-login:', error)
      return res.redirect('/')
    }
  }
)

/**
 * 👤 GET /auth/me
 * ➤ Retorna información del usuario autenticado (si hay sesión activa)
 */
router.get('/me', (req, res) => {
  if (!req.isAuthenticated?.() || !req.user) {
    return res.status(401).json({
      ok: false,
      message: '🔒 Usuario no autenticado'
    })
  }

  const { _id, name, email, role } = req.user

  return res.status(200).json({
    ok: true,
    user: { id: _id, name, email, role }
  })
})

/**
 * 🚪 GET /auth/logout
 * ➤ Cierra sesión y limpia cookies
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
