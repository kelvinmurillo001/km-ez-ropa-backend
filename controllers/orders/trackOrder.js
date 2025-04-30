import Order from '../../models/Order.js'

/**
 * 🔍 Buscar pedido por código de seguimiento
 * @route GET /api/orders/track/:codigo
 */
const trackOrder = async (req, res) => {
  try {
    const { codigo } = req.params

    if (!codigo || typeof codigo !== 'string' || codigo.trim().length < 3) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Código de seguimiento inválido'
      })
    }

    const pedido = await Order.findOne({ codigoSeguimiento: codigo.trim() }).lean()

    if (!pedido) {
      return res.status(404).json({
        ok: false,
        message: '❌ Pedido no encontrado'
      })
    }

    res.status(200).json({
      ok: true,
      message: '✅ Pedido encontrado',
      seguimiento: pedido.seguimiento || '',
      estadoActual: pedido.estado,
      resumen: {
        nombre: pedido.nombreCliente,
        total: pedido.total,
        metodoPago: pedido.metodoPago || 'no especificado',
        direccion: pedido.direccion || 'no proporcionada'
      }
    })
  } catch (err) {
    console.error('❌ Error en trackOrder:', err)
    res.status(500).json({
      ok: false,
      message: '❌ Error en el servidor al buscar el pedido',
      error: err.message
    })
  }
}

export default trackOrder
