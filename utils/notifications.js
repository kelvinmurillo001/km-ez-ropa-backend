/**
 * 📢 Simula el envío de notificaciones por WhatsApp y Email.
 * @param {Object} params
 * @param {string} params.nombreCliente - Nombre del cliente
 * @param {string} params.telefono - Número de teléfono (WhatsApp)
 * @param {string} params.email - Correo electrónico
 * @param {string} params.estadoActual - Estado del pedido
 * @param {string} [params.tipo='estado'] - Tipo de notificación (opcional)
 */
export async function sendNotification({ nombreCliente, telefono, email, estadoActual, tipo = 'estado' }) {
  try {
    if (!nombreCliente || typeof nombreCliente !== 'string') {
      throw new Error('❌ Nombre del cliente no válido');
    }

    const mensaje = generarMensaje(nombreCliente.trim(), estadoActual?.trim() || '', tipo);

    // 🟢 Simulación de WhatsApp
    if (telefono && validarTelefono(telefono)) {
      console.log(`📲 WhatsApp a ${telefono}: ${mensaje}`);
    } else {
      console.warn('⚠️ Número de teléfono no válido o no proporcionado.');
    }

    // 🟢 Simulación de Email
    if (email && validarEmail(email)) {
      console.log(`📧 Email a ${email}: [Actualización de tu pedido] ${mensaje}`);
    } else {
      console.warn('⚠️ Email no válido o no proporcionado.');
    }

    console.log('✅ Notificaciones simuladas correctamente.');
  } catch (err) {
    console.error('❌ Error al enviar notificaciones:', err.message || err);
  }
}

/**
 * 🧠 Genera mensaje personalizado según el estado y tipo
 * @param {string} nombre - Nombre del cliente
 * @param {string} estado - Estado del pedido (recibido, preparando, etc.)
 * @param {string} tipo - Tipo de notificación ('creacion', 'estado', etc.)
 * @returns {string}
 */
function generarMensaje(nombre, estado, tipo = 'estado') {
  const nombreLimpio = nombre[0].toUpperCase() + nombre.slice(1);

  const mensajesPorEstado = {
    recibido: `📥 Hola ${nombreLimpio}, hemos recibido tu pedido correctamente.`,
    preparando: `🛠️ Hola ${nombreLimpio}, tu pedido se encuentra en preparación.`,
    en_proceso: `🛠️ Hola ${nombreLimpio}, tu pedido ya se está procesando.`,
    enviado: `🚚 Hola ${nombreLimpio}, tu pedido ha sido enviado y está en camino.`,
    entregado: `📦 Hola ${nombreLimpio}, tu pedido fue entregado. ¡Gracias por tu compra!`,
    pagado: `💰 Hola ${nombreLimpio}, tu pago ha sido confirmado.`
  };

  if (tipo === 'creacion') {
    return `✅ Hola ${nombreLimpio}, tu pedido ha sido registrado con éxito. ¡Gracias por confiar en KM & EZ ROPA!`;
  }

  return mensajesPorEstado[estado.toLowerCase()] ||
    `📦 Hola ${nombreLimpio}, tu pedido tiene una nueva actualización.`;
}

/**
 * 📞 Validación básica de número de teléfono (WhatsApp)
 * @param {string} telefono
 * @returns {boolean}
 */
function validarTelefono(telefono) {
  return /^[0-9+\-\s]{7,20}$/.test(telefono);
}

/**
 * 📧 Validación básica de email
 * @param {string} email
 * @returns {boolean}
 */
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
