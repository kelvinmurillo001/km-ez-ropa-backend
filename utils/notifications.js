// ✅ backend/utils/notifications.js

// Si quieres enviar WhatsApp real, luego integramos Twilio / WATI
// Para Email, podrías usar nodemailer o SendGrid (lo dejo preparado)

// ⚙️ Función principal
export const sendNotification = async ({ nombreCliente, telefono, email, estadoActual }) => {
  try {
    const mensaje = generarMensaje(nombreCliente, estadoActual)

    // Enviar WhatsApp (simulado aquí)
    await enviarWhatsapp(telefono, mensaje)

    // Enviar Email (simulado aquí)
    await enviarEmail(email, 'Actualización de tu Pedido', mensaje)

    console.log('✅ Notificaciones enviadas correctamente.')
  } catch (error) {
    console.error('❌ Error enviando notificaciones:', error.message)
  }
}

// 📝 Genera mensaje amigable basado en estado
function generarMensaje (nombre, estado) {
  const estados = {
    recibido: `🎉 Hola ${nombre}, hemos recibido tu pedido. ¡Gracias por tu compra!`,
    preparando: `🛠️ Hola ${nombre}, estamos preparando tu pedido.`,
    'en camino': `🚚 Hola ${nombre}, tu pedido ya va en camino.`,
    entregado: `✅ Hola ${nombre}, tu pedido fue entregado exitosamente. ¡Esperamos que lo disfrutes!`
  }

  return estados[estado.toLowerCase()] || `📦 Hola ${nombre}, actualización de tu pedido.`
}

// 📲 Simula envío de WhatsApp (preparado para conectar Twilio o API real)
async function enviarWhatsapp (telefono, mensaje) {
  if (!telefono) return console.warn('⚠️ No hay número de teléfono para enviar WhatsApp.')
  console.log(`📲 WhatsApp a ${telefono}: ${mensaje}`)
  // Aquí conectas tu servicio real como Twilio, WATI, etc
}

// 📧 Simula envío de Email (preparado para conectar Nodemailer, SendGrid, etc)
async function enviarEmail (destinatario, asunto, contenido) {
  if (!destinatario) return console.warn('⚠️ No hay correo para enviar Email.')
  console.log(`📧 Email a ${destinatario}: [${asunto}] ${contenido}`)
  // Aquí conectas tu servicio real de envío de emails
}
