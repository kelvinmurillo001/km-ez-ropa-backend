// 📁 backend/routes/auth.js
import express from 'express';
import passport from 'passport';
import logger from '../utils/logger.js';

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔐 AUTENTICACIÓN CON GOOGLE                                                */
/* -------------------------------------------------------------------------- */

/**
 * 🎯 GET /auth/google
 * ➤ Redirige a Google para iniciar sesión
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account' // Fuerza selector de cuenta
  })
);

/**
 * ✅ GET /auth/google/callback
 * ➤ Callback desde Google tras login exitoso
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login.html',
    failureMessage: true,
    session: true
  }),
  (req, res) => {
    try {
      const role = req.user?.role || 'client';

      const redirectUrl = role === 'admin'
        ? 'https://kmezropacatalogo.com/admin'
        : 'https://kmezropacatalogo.com/cliente';

      logger.info(`🔐 Login exitoso vía Google - Usuario: ${req.user.email}, Rol: ${role}`);
      return res.redirect(redirectUrl);
    } catch (error) {
      logger.error('❌ Error en redirección post-login:', error);
      return res.redirect('/login.html');
    }
  }
);

/**
 * 👤 GET /auth/me
 * ➤ Retorna datos del usuario autenticado
 */
router.get('/me', (req, res) => {
  if (!req.isAuthenticated?.() || !req.user) {
    logger.warn(`🔒 Acceso denegado a /me desde IP: ${req.ip}`);
    return res.status(401).json({
      ok: false,
      message: '🔒 Usuario no autenticado'
    });
  }

  const { _id, name, email, role } = req.user;
  return res.status(200).json({
    ok: true,
    user: { id: _id, name, email, role }
  });
});

/**
 * 🚪 GET /auth/logout
 * ➤ Finaliza sesión y limpia cookies
 */
router.get('/logout', (req, res) => {
  try {
    req.logout(err => {
      if (err) {
        logger.error('❌ Error al cerrar sesión:', err);
        return res.status(500).json({
          ok: false,
          message: '❌ Error al cerrar sesión'
        });
      }

      req.session?.destroy(destroyErr => {
        if (destroyErr) logger.warn('⚠️ Error al destruir sesión:', destroyErr);

        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        return res.status(200).json({
          ok: true,
          message: '✅ Sesión cerrada correctamente'
        });
      });
    });
  } catch (err) {
    logger.error('❌ Error inesperado en /logout:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno cerrando sesión'
    });
  }
});

export default router;
