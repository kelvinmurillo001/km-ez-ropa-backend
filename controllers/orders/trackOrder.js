// 📁 backend/controllers/orders/trackOrder.js
import Order from '../../models/Order.js'

/**
 * 🔍 Buscar pedido por código de seguimiento
 * @route   GET /api/orders/track/:codigo
 * @access  Público
 */
const trackOrder = async (req, res) => {
  try {
    // 📌 Sanitizar y validar código de seguimiento
    const rawCode = String(req.params.codigo || '').trim().toUpperCase()

    if (!/^[A-Z0-9_-]{3,}$/.test(rawCode)) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Código de seguimiento inválido (mínimo 3 caracteres, solo letras, números, guiones y guiones bajos)'
      })
    }

    // 🔎 Buscar pedido por código (case-sensitive por normalización previa)
    const pedido = await Order.findOne({ codigoSeguimiento: rawCode })
      .select('nombreCliente total metodoPago direccion nota createdAt seguimiento estado')
      .lean()

    if (!pedido) {
      return res.status(404).json({
        ok: false,
        message: '❌ No se encontró ningún pedido con ese código de seguimiento.'
      })
    }

    // 🧾 Construir resumen
    const resumen = {
      nombre: pedido.nombreCliente || 'Cliente desconocido',
      total: typeof pedido.total === 'number' ? pedido.total : 0,
      metodoPago: pedido.metodoPago || 'No especificado',
      direccion: pedido.direccion || 'No proporcionada',
      nota: pedido.nota || '',
      fecha: pedido.createdAt ? new Date(pedido.createdAt).toISOString() : null
    }

    return res.status(200).json({
      ok: true,
      data: {
        seguimiento: pedido.seguimiento || '',
        estadoActual: pedido.estado || 'pendiente',
        resumen
      }
    })
  } catch (err) {
    console.error('❌ Error al rastrear pedido:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno del servidor al rastrear el pedido.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    })
  }
}

export default trackOrder
