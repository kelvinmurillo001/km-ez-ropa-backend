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
 * ➤ Genera nueva contraseña aleatoria y la envía al usuario registrado
 */
router.post('/auth/reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validator.isEmail(email.trim())) {
      return res.status(400).json({ message: '⚠️ Email inválido.' });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: sanitizedEmail });

    // 🔐 Seguridad: nunca revelar si el correo existe
    if (!user) {
      logger.warn(`⚠️ Solicitud de reset para email NO registrado: ${sanitizedEmail}`);
      return res.status(200).json({
        message: '📬 Si el correo está registrado, enviaremos una nueva contraseña.'
      });
    }

    // 🔐 Generar nueva clave segura
    const nuevaClave = crypto.randomBytes(6).toString('hex');
    user.password = nuevaClave;
    await user.save();

    // ✉️ Plantilla de correo personalizada
    const html = `
      <p>Hola <strong>${user.name}</strong>,</p>
      <p>Hemos generado una nueva contraseña para tu cuenta:</p>
      <p style="font-size:1.2rem; font-weight:bold; color:#222; background:#f1f1f1; padding:10px 14px; display:inline-block; border-radius:6px;">
        ${nuevaClave}
      </p>
      <p>Te recomendamos cambiarla una vez que inicies sesión:</p>
      <p><a href="https://kmezropacatalogo.com/login.html">🔐 Iniciar sesión</a></p>
      <hr/>
      <small>Si tú no solicitaste este cambio, puedes ignorar este mensaje.</small>
    `;

    await sendEmail(sanitizedEmail, '🔐 Tu nueva contraseña - KM & EZ ROPA', html);

    logger.info(`📧 Nueva contraseña generada y enviada a ${sanitizedEmail}`);
    return res.status(200).json({
      message: '✅ Si el correo está registrado, se ha enviado una nueva contraseña.'
    });
  } catch (err) {
    logger.error('❌ Error en POST /auth/reset:', err);
    return res.status(500).json({
      message: '❌ No se pudo procesar la solicitud. Intenta nuevamente más tarde.'
    });
  }
});

export default router;
