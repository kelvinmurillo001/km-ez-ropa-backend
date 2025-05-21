// 📁 backend/routes/reset.js
import express from 'express';
import crypto from 'crypto';
import validator from 'validator';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import sendEmail from '../utils/emailSender.js';

const router = express.Router();

/**
 * 📩 POST /api/auth/reset
 * ➤ Genera nueva contraseña aleatoria y la envía por correo si el usuario existe
 */
router.post('/auth/reset', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    // ✏️ Validar formato de email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: '⚠️ Ingresa un correo válido.' });
    }

    const user = await User.findOne({ email });

    // 🛡️ Seguridad: nunca revelar si existe
    if (!user) {
      logger.warn(`📬 Solicitud de reset para email NO registrado: ${email}`);
      return res.status(200).json({
        message: '📬 Si el correo está registrado, enviaremos una nueva contraseña.'
      });
    }

    // 🔐 Generar clave aleatoria segura (12 caracteres)
    const nuevaClave = crypto.randomBytes(6).toString('hex');

    user.password = nuevaClave;
    await user.save();

    // ✉️ Plantilla de email
    const html = `
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Tu nueva contraseña es:</p>
      <p style="font-size:1.2rem; font-weight:bold; color:#222; background:#f1f1f1; padding:10px 14px; display:inline-block; border-radius:6px;">
        ${nuevaClave}
      </p>
      <p>Ingresa a tu cuenta aquí: 
        <a href="https://kmezropacatalogo.com/login.html" target="_blank">🔐 Iniciar sesión</a>
      </p>
      <hr />
      <small>Si no solicitaste esto, simplemente ignora este mensaje.</small>
    `;

    await sendEmail(email, '🔐 Tu nueva contraseña - KM & EZ ROPA', html);

    logger.info(`✅ Contraseña reiniciada y enviada a: ${email}`);
    return res.status(200).json({
      message: '✅ Si el correo está registrado, se ha enviado una nueva contraseña.'
    });
  } catch (err) {
    logger.error('❌ Error en /auth/reset:', err);
    return res.status(500).json({
      message: '❌ No se pudo completar la solicitud. Intenta más tarde.'
    });
  }
});

export default router;
