// 📁 backend/routes/auth.js
import express from 'express'
import passport from 'passport'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 🔐 Autenticación con Google                                                */
/* -------------------------------------------------------------------------- */

/**
 * 🎯 Iniciar login con Google
 * Redirige al consentimiento de Google con los scopes necesarios.
 */
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

/**
 * ✅ Callback después de Google Login
 * Decide redirección según el rol: admin → /admin, cliente → /cliente
 */
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    if (req.user?.role === 'admin') {
      return res.redirect('https://kmezropacatalogo.com/admin')
    } else {
      return res.redirect('https://kmezropacatalogo.com/cliente')
    }
  }
)

/**
 * 👤 Obtener el usuario autenticado
 */
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' })
  }
  res.json(req.user)
})

/**
 * 🚪 Cerrar sesión
 * Destruye la sesión y limpia la cookie de sesión
 */
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('connect.sid')
      res.json({ message: 'Sesión cerrada correctamente' })
    })
  })
})

export default router
