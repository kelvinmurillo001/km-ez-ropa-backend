/**
 * 📢 Simula el envío de notificaciones por WhatsApp y Email.
 * @param {Object} params
 * @param {string} params.nombreCliente - Nombre del cliente
 * @param {string} params.telefono - Número de teléfono (WhatsApp)
 * @param {string} params.email - Correo electrónico
 * @param {string} params.estadoActual - Estado del pedido
 */
export async function sendNotification({ nombreCliente, telefono, email, estadoActual }) {
  try {
    if (!nombreCliente || typeof nombreCliente !== 'string') {
      throw new Error('❌ Nombre del cliente no válido');
    }

    let mensaje = generarMensaje(nombreCliente, estadoActual);

    if (telefono && validarTelefono(telefono)) {
      console.log(`📲 WhatsApp a ${telefono}: ${mensaje}`);
    } else {
      console.warn('⚠️ Número de teléfono no válido o no proporcionado para WhatsApp.');
    }

    if (email && validarEmail(email)) {
      console.log(`📧 Email a ${email}: [Actualización de tu Pedido] ${mensaje}`);
    } else {
      console.warn('⚠️ Email no válido o no proporcionado para enviar correo.');
    }

    console.log('✅ Notificaciones simuladas correctamente.');
  } catch (err) {
    console.error('❌ Error al enviar notificaciones:', err.message || err);
  }
}

/**
 * 🧠 Genera el mensaje según el estado del pedido
 */
function generarMensaje(nombre, estado = '') {
  switch (estado.trim().toLowerCase()) {
    case 'recibido':
      return `📥 Hola ${nombre}, hemos recibido tu pedido.`;
    case 'preparando':
      return `🛠️ Hola ${nombre}, estamos preparando tu pedido.`;
    case 'en camino':
      return `🚚 Hola ${nombre}, tu pedido está en camino.`;
    case 'entregado':
      return `📦 Hola ${nombre}, tu pedido fue entregado. ¡Gracias por tu compra!`;
    default:
      return `📦 Hola ${nombre}, hay una actualización en tu pedido.`;
  }
}

/**
 * 📞 Validación básica de número de teléfono
 */
function validarTelefono(telefono) {
  return /^[0-9+\-\s]{7,20}$/.test(telefono);
}

/**
 * 📧 Validación básica de email
 */
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
