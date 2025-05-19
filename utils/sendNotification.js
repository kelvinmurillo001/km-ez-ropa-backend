// 📁 backend/utils/sendNotification.js
import nodemailer from 'nodemailer';
import config from '../config/configuracionesito.js';

/**
 * ✉️ Transporter SMTP configurado dinámicamente desde .env
 */
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: Boolean(config.smtpSecure), // true para 465, false para otros
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass
  }
});

/**
 * 📧 Enviar una notificación de pedido por correo
 * @param {Object} options
 * @param {string} options.email - Correo del cliente
 * @param {string} options.nombreCliente - Nombre del cliente
 * @param {string} options.estadoActual - Estado del pedido (ej: "enviado")
 * @param {string} [options.tipo='actualizacion'] - Tipo: 'creacion' | 'actualizacion'
 * @returns {Promise<void>}
 */
export async function sendNotification({
  email,
  nombreCliente,
  estadoActual,
  tipo = 'actualizacion'
}) {
  try {
    if (!email || !nombreCliente || !estadoActual) {
      throw new Error('Faltan datos requeridos para enviar notificación.');
    }

    const cleanName = String(nombreCliente).trim();
    const estado = String(estadoActual).trim().toUpperCase();

    const asunto = tipo === 'creacion'
      ? '🛒 Confirmación de tu pedido en KM & EZ ROPA'
      : '📦 Estado actualizado de tu pedido';

    const mensajeHTML = tipo === 'creacion'
      ? `<p>Hola <strong>${cleanName}</strong>,<br/>Hemos recibido tu pedido correctamente. Nos pondremos en contacto contigo pronto con más detalles.</p>`
      : `<p>Hola <strong>${cleanName}</strong>,<br/>El estado de tu pedido ha sido actualizado a: <strong>${estado}</strong>.</p>`;

    const html = `
      <div style="font-family:sans-serif; color:#333;">
        ${mensajeHTML}
        <p style="margin-top: 20px;">Gracias por confiar en <strong>KM & EZ ROPA</strong> 🧵</p>
      </div>
    `;

    const response = await transporter.sendMail({
      from: `"KM & EZ ROPA" <${config.smtpFrom || config.smtpUser}>`,
      to: email,
      subject: asunto,
      html
    });

    if (config.env !== 'production') {
      console.log(`✅ Email enviado a ${email}: ${response.messageId}`);
    }

  } catch (err) {
    console.error(`❌ Error al enviar correo a ${email}:`, err.message || err);
  }
}
