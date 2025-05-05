import nodemailer from "nodemailer";

// ✅ Configuración para cuentas Outlook / Hotmail / Office 365
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_FROM,       // ejemplo: tu-email@outlook.com
    pass: process.env.EMAIL_PASSWORD    // contraseña o app password
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

/**
 * Envía una notificación por correo al cliente.
 * Puede usarse tanto para la creación como para la actualización del pedido.
 *
 * @param {Object} params
 * @param {string} params.email - Correo del cliente
 * @param {string} params.nombreCliente - Nombre del cliente
 * @param {string} params.estadoActual - Estado del pedido (ej: "pendiente")
 * @param {string} [params.tipo] - 'creacion' o 'estado' (por defecto: 'estado')
 */
export const sendNotification = async ({
  email,
  nombreCliente,
  estadoActual,
  tipo = 'estado'
}) => {
  if (!email || !estadoActual) return;

  const estadoTexto = {
    pendiente: "⏳ Pendiente",
    en_proceso: "🛠️ Procesando",
    procesando: "🛠️ Procesando",
    enviado: "🚚 Enviado",
    entregado: "📬 Entregado",
    cancelado: "❌ Cancelado",
    pagado: "💰 Pagado"
  };

  const asunto = tipo === "creacion"
    ? "✅ Pedido recibido con éxito - KM & EZ ROPA"
    : `📦 Tu pedido ha sido actualizado - Estado: ${estadoTexto[estadoActual] || estadoActual}`;

  const mensaje = tipo === "creacion"
    ? `
      <h2>Hola ${nombreCliente || "cliente"},</h2>
      <p>Hemos recibido tu pedido y estamos procesándolo. 🎉</p>
      <p>Estado actual: <strong style="color:#ff6d00;">${estadoTexto[estadoActual]}</strong></p>
      <p>Te notificaremos cuando el estado cambie.</p>
    `
    : `
      <h2>Hola ${nombreCliente || "cliente"},</h2>
      <p>El estado de tu pedido ha sido actualizado a:</p>
      <h3 style="color:#ff6d00;">${estadoTexto[estadoActual] || estadoActual}</h3>
    `;

  const mailOptions = {
    from: `"KM & EZ ROPA" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: asunto,
    html: `
      <div style="font-family:sans-serif; color:#333;">
        ${mensaje}
        <p>📦 Puedes ver el detalle completo de tu pedido desde tu cuenta.</p>
        <p>Gracias por confiar en <strong>KM & EZ ROPA</strong>.</p>
        <br/>
        <small>No respondas a este correo. Es una notificación automática.</small>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Notificación de ${tipo} enviada a ${email}`);
  } catch (err) {
    console.error("❌ Error al enviar correo:", err.message);
  }
};
