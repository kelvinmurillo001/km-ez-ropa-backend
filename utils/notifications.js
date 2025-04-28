// ✅ backend/utils/notifications.js

// 🛠️ Preparado para integrar Twilio / WATI (WhatsApp) y Nodemailer / SendGrid (Email)

/**
 * ⚙️ Función principal para enviar notificaciones
 * @param {Object} param0 - Datos del cliente y estado
 */
export const sendNotification = async ({ nombreCliente, telefono, email, estadoActual }) => {
  try {
    const mensaje = generarMensaje(nombreCliente, estadoActual);

    // 📲 Simulación de envío de WhatsApp
    await enviarWhatsapp(telefono, mensaje);

    // 📧 Simulación de envío de Email
    await enviarEmail(email, 'Actualización de tu Pedido', mensaje);

    console.log('✅ Notificaciones enviadas correctamente.');
  } catch (error) {
    console.error('❌ Error enviando notificaciones:', error.message);
  }
};

/**
 * 📝 Genera un mensaje amigable basado en el estado del pedido
 * @param {string} nombre - Nombre del cliente
 * @param {string} estado - Estado actual del pedido
 * @returns {string} - Mensaje generado
 */
function generarMensaje(nombre, estado) {
  const estados = {
    recibido: `🎉 Hola ${nombre}, hemos recibido tu pedido. ¡Gracias por tu compra!`,
    preparando: `🛠️ Hola ${nombre}, estamos preparando tu pedido.`,
    'en camino': `🚚 Hola ${nombre}, tu pedido ya va en camino.`,
    entregado: `✅ Hola ${nombre}, tu pedido fue entregado exitosamente. ¡Esperamos que lo disfrutes!`
  };

  return estados[estado.toLowerCase()] || `📦 Hola ${nombre}, actualización de tu pedido.`;
}

/**
 * 📲 Simula envío de WhatsApp (puede integrarse Twilio, WATI, etc)
 * @param {string} telefono - Número de teléfono
 * @param {string} mensaje - Contenido del mensaje
 */
async function enviarWhatsapp(telefono, mensaje) {
  if (!telefono) {
    console.warn('⚠️ No hay número de teléfono para enviar WhatsApp.');
    return;
  }
  console.log(`📲 WhatsApp a ${telefono}: ${mensaje}`);
}

/**
 * 📧 Simula envío de Email (puede integrarse Nodemailer, SendGrid, etc)
 * @param {string} destinatario - Email destino
 * @param {string} asunto - Asunto del correo
 * @param {string} contenido - Contenido del mensaje
 */
async function enviarEmail(destinatario, asunto, contenido) {
  if (!destinatario) {
    console.warn('⚠️ No hay correo para enviar Email.');
    return;
  }
  console.log(`📧 Email a ${destinatario}: [${asunto}] ${contenido}`);
}
