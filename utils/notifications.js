// 📁 backend/utils/notifications.js

/**
 * Simula el envío de notificaciones por WhatsApp y Email.
 * @param {Object} params
 * @param {string} params.nombreCliente
 * @param {string} params.telefono
 * @param {string} params.email
 * @param {string} params.estadoActual
 */
export async function sendNotification({ nombreCliente, telefono, email, estadoActual }) {
  try {
    let mensaje = ''

    switch (estadoActual.toLowerCase()) {
      case 'recibido':
        mensaje = `📥 Hola ${nombreCliente}, recibimos tu pedido.`
        break
      case 'preparando':
        mensaje = `🛠️ Hola ${nombreCliente}, estamos preparando tu pedido.`
        break
      case 'en camino':
        mensaje = `🚚 Hola ${nombreCliente}, tu pedido está en camino.`
        break
      case 'entregado':
        mensaje = `📦 Hola ${nombreCliente}, tu pedido fue entregado.`
        break
      default:
        mensaje = `📦 Hola ${nombreCliente}, actualización de tu pedido.`
        break
    }

    if (telefono) {
      console.log(`📲 WhatsApp a ${telefono}: ${mensaje}`)
    } else {
      console.warn('⚠️ No hay número de teléfono para enviar WhatsApp.')
    }

    if (email) {
      console.log(`📧 Email a ${email}: [Actualización de tu Pedido] ${mensaje}`)
    } else {
      console.warn('⚠️ No hay correo para enviar Email.')
    }

    console.log('✅ Notificaciones enviadas correctamente.')
  } catch (err) {
    console.error('❌ Error enviando notificaciones:', err.message || err)
  }
}
