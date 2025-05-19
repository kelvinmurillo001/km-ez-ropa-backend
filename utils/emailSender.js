// 📁 backend/utils/emailSender.js
import nodemailer from 'nodemailer';
import validator from 'validator';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD
  },
  secure: true
});

/**
 * 📧 Enviar correo electrónico HTML con validación estricta
 * @param {string} to - Dirección de correo destino
 * @param {string} subject - Asunto del correo
 * @param {string} html - Contenido HTML
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!validator.isEmail(to)) {
      throw new Error(`Email inválido: ${to}`);
    }

    if (
      !subject || typeof subject !== 'string' || subject.trim().length < 3 ||
      !html || typeof html !== 'string' || html.trim().length < 10
    ) {
      throw new Error('⚠️ Asunto o contenido HTML inválido.');
    }

    const mailOptions = {
      from: `"KM & EZ ROPA" <${process.env.EMAIL_FROM}>`,
      to,
      subject: subject.trim(),
      html: html.trim(),
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'KM-EZ-ROPA-Mailer'
      }
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`📨 Correo enviado a ${to} | ID: ${info.messageId}`);
    return true;
  } catch (err) {
    logger.error(`❌ Error al enviar correo a ${to}: ${err.message}`);
    throw new Error('❌ No se pudo enviar el correo.');
  }
};

export default sendEmail;
