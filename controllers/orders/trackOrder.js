// backend\controllers\orders\trackOrder.js
import Order from '../../models/Order.js'

const trackOrder = async (req, res) => {
  try {
    const { codigo } = req.params

    const pedido = await Order.findOne({ codigoSeguimiento: codigo }).lean()
    if (!pedido) {
      return res.status(404).json({ ok: false, message: '❌ Pedido no encontrado' })
    }

    res.json({
      ok: true,
      message: '✅ Pedido encontrado',
      seguimiento: pedido.seguimiento,
      estadoActual: pedido.estado,
      resumen: {
        nombre: pedido.nombreCliente,
        total: pedido.total,
        metodoPago: pedido.metodoPago,
        direccion: pedido.direccion
      }
    })
  } catch (err) {
    console.error('❌ Error en trackOrder:', err)
    res.status(500).json({ ok: false, message: '❌ Error en el servidor', error: err.message })
  }
}

export default trackOrder
