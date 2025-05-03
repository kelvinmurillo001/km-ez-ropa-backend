// 📁 backend/controllers/orders/trackOrder.js

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

    const resumen = {
      nombre: pedido.nombreCliente || 'Sin nombre',
      total: pedido.total || 0,
      metodoPago: pedido.metodoPago || 'no especificado',
      direccion: pedido.direccion || 'no proporcionada',
      nota: pedido.nota || '',
      fecha: pedido.createdAt || null
    }

    return res.status(200).json({
      ok: true,
      message: '✅ Pedido encontrado',
      seguimiento: pedido.seguimiento || '',
      estadoActual: pedido.estado || 'pendiente',
      resumen
    })
  } catch (err) {
    console.error('❌ Error en trackOrder:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error en el servidor al buscar el pedido',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}

export default trackOrder
