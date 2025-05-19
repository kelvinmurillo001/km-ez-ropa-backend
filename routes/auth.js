// 📁 backend/routes/auth.js
import express from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';

import User from '../models/User.js';
import logger from '../utils/logger.js';
import sendEmail from '../utils/emailSender.js';

import { loginCliente, getUsuarioActual } from '../controllers/authController.js';
import { loginClienteValidation } from '../validators/authValidator.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔐 LOGIN CLIENTE (con JWT)                                                 */
/* -------------------------------------------------------------------------- */
router.post('/login-cliente', loginClienteValidation, loginCliente);

/* -------------------------------------------------------------------------- */
/* 🔐 AUTENTICACIÓN CON GOOGLE (OAuth)                                        */
/* -------------------------------------------------------------------------- */
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
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
      res.redirect(redirectUrl);
    } catch (err) {
      logger.error('❌ Error redirigiendo después de login:', err);
      res.redirect('/login.html');
    }
  }
);

/* -------------------------------------------------------------------------- */
/* 🔍 USUARIO AUTENTICADO ACTUAL (por JWT o sesión)                           */
/* -------------------------------------------------------------------------- */
router.get('/me', authMiddleware, getUsuarioActual);

/* -------------------------------------------------------------------------- */
/* 🚪 CERRAR SESIÓN                                                           */
/* -------------------------------------------------------------------------- */
router.get('/logout', (req, res) => {
  try {
    req.logout(err => {
      if (err) {
        logger.error('❌ Error al cerrar sesión:', err);
        return res.status(500).json({ ok: false, message: '❌ Error al cerrar sesión' });
      }

      req.session?.destroy(destroyErr => {
        if (destroyErr) logger.warn('⚠️ Error al destruir sesión:', destroyErr);

        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        return res.status(200).json({ ok: true, message: '✅ Sesión cerrada correctamente' });
      });
    });
  } catch (err) {
    logger.error('❌ Error inesperado en /logout:', err);
    return res.status(500).json({ ok: false, message: '❌ Error cerrando sesión' });
  }
});

/* -------------------------------------------------------------------------- */
/* ✉️ SOLICITUD DE RESETEO DE CONTRASEÑA                                      */
/* -------------------------------------------------------------------------- */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: '⚠️ Correo inválido' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // No revelar si el email existe
    if (!user) {
      logger.warn(`⚠️ Reset solicitado para correo no registrado: ${normalizedEmail}`);
      return res.status(200).json({
        ok: true,
        message: '📬 Si el correo está registrado, se ha enviado un enlace de recuperación.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await user.save();

    const resetLink = `https://kmezropacatalogo.com/resetear.html?token=${token}`;
    await sendEmail(
      normalizedEmail,
      '🔐 Recuperar contraseña',
      `
        <p>Hola ${user.name},</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <hr/>
        <small>Si no solicitaste este correo, puedes ignorarlo.</small>
      `
    );

    logger.info(`📧 Token de recuperación enviado a ${user.email}`);
    return res.status(200).json({
      ok: true,
      message: '📬 Si el correo está registrado, se ha enviado un enlace de recuperación.'
    });
  } catch (err) {
    logger.error('❌ Error en forgot-password:', err);
    res.status(500).json({ message: '❌ No se pudo enviar el correo de recuperación.' });
  }
});

/* -------------------------------------------------------------------------- */
/* 🔁 CAMBIO DE CONTRASEÑA DESDE TOKEN                                        */
/* -------------------------------------------------------------------------- */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string' || !password || password.length < 6) {
      return res.status(400).json({ message: '❌ Token o nueva contraseña inválidos' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: '❌ Token inválido o expirado.' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetToken = null;
    user.resetExpires = null;

    await user.save();

    logger.info(`🔁 Contraseña actualizada para ${user.email}`);
    return res.status(200).json({
      success: true,
      message: '✅ Contraseña actualizada correctamente.'
    });
  } catch (err) {
    logger.error('❌ Error en reset-password:', err);
    res.status(500).json({ message: '❌ No se pudo actualizar la contraseña.' });
  }
});

export default router;
