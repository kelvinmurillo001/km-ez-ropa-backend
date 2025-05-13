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
/* 🔐 LOGIN CLIENTE JWT (NUEVO)                                               */
/* -------------------------------------------------------------------------- */
router.post('/login-cliente', loginClienteValidation, loginCliente);

/* -------------------------------------------------------------------------- */
/* 🔐 AUTENTICACIÓN CON GOOGLE                                                */
/* -------------------------------------------------------------------------- */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

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

/* -------------------------------------------------------------------------- */
/* 👤 USUARIO ACTUAL AUTENTICADO                                              */
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
    return res.status(500).json({ ok: false, message: '❌ Error interno cerrando sesión' });
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

    if (!user) {
      logger.warn(`⚠️ Reset solicitado para correo inexistente: ${normalizedEmail}`);
      return res.status(200).json({ ok: true, message: '📬 Si el correo existe, se envió el enlace' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
    await user.save();

    const resetLink = `https://kmezropacatalogo.com/resetear.html?token=${token}`;
    await sendEmail(
      normalizedEmail,
      '🔐 Recuperar Contraseña',
      `
        <p>Hola ${user.name || ''},</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      `
    );

    logger.info(`📧 Token de recuperación enviado a ${user.email}`);
    res.json({ ok: true, message: '📬 Si el correo existe, se envió el enlace de recuperación' });
  } catch (err) {
    logger.error('❌ Error en forgot-password:', err);
    res.status(500).json({ message: '❌ Error enviando recuperación' });
  }
});

/* -------------------------------------------------------------------------- */
/* 🔁 RESETEO DE CONTRASEÑA                                                   */
/* -------------------------------------------------------------------------- */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: '❌ Token o contraseña inválidos' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: '❌ Token inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetExpires = null;

    await user.save();
    logger.info(`🔁 Contraseña reseteada correctamente para ${user.email}`);

    res.json({ success: true, message: '✅ Contraseña actualizada correctamente.' });
  } catch (err) {
    logger.error('❌ Error en reset-password:', err);
    res.status(500).json({ message: '❌ Error al resetear contraseña.' });
  }
});

export default router;
