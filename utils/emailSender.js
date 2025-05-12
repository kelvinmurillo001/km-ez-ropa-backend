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
 * 📧 Enviar email con validación estricta
 * @param {string} to - Email destino
 * @param {string} subject - Asunto del email
 * @param {string} html - Contenido HTML del mensaje
 */
const sendEmail = async (to, subject, html) => {
  try {
    // Validar email destino
    if (!validator.isEmail(to)) {
      throw new Error(`Email inválido: ${to}`);
    }

    // Validación básica de contenido
    if (!subject || !html || typeof subject !== 'string' || typeof html !== 'string') {
      throw new Error('Asunto o contenido no válido.');
    }

    const info = await transporter.sendMail({
      from: `"KM & EZ ROPA" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'KM&EZ-Mailer'
      }
    });

    logger.info(`📨 Correo enviado a ${to} | ID: ${info.messageId}`);
  } catch (error) {
    logger.error(`❌ Error al enviar correo a ${to}: ${error.message}`);
    throw new Error('No se pudo enviar el correo.');
  }
};

export default sendEmail;
