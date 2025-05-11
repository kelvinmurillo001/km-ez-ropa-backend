import nodemailer from 'nodemailer'
import config from '../config/configuracionesito.js'

// 🛠️ Transport configurado con variables de entorno
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpSecure, // true para 465, false para otros
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass
  }
})

/**
 * 📧 Envía una notificación por correo electrónico al cliente
 * @param {Object} options
 * @param {string} options.email - Correo del cliente
 * @param {string} options.nombreCliente - Nombre del cliente
 * @param {string} options.estadoActual - Estado del pedido
 * @param {string} [options.tipo='actualizacion'] - Tipo: 'creacion' | 'actualizacion'
 */
export async function sendNotification({
  email,
  nombreCliente,
  estadoActual,
  tipo = 'actualizacion'
}) {
  try {
    if (!email || !estadoActual || !nombreCliente) return

    const asunto =
      tipo === 'creacion'
        ? '🛒 Confirmación de tu pedido en KM & EZ ROPA'
        : '📦 Estado actualizado de tu pedido'

    const mensaje =
      tipo === 'creacion'
        ? `<p>Hola <strong>${nombreCliente}</strong>,<br/>Hemos recibido tu pedido correctamente. Nos pondremos en contacto pronto con más detalles.</p>`
        : `<p>Hola <strong>${nombreCliente}</strong>,<br/>El estado de tu pedido ha sido actualizado a: <strong>${estadoActual.toUpperCase()}</strong>.</p>`

    const html = `
      <div style="font-family:sans-serif;color:#333">
        ${mensaje}
        <p style="margin-top:20px;">Gracias por confiar en <strong>KM & EZ ROPA</strong> 🧵</p>
      </div>
    `

    await transporter.sendMail({
      from: `"KM & EZ ROPA" <${config.smtpFrom || config.smtpUser}>`,
      to: email,
      subject: asunto,
      html
    })
  } catch (err) {
    console.error('❌ Error al enviar correo:', err.message || err)
  }
}
