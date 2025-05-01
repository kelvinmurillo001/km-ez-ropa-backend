// 📁 backend/controllers/paypalController.js
import { crearOrden, capturarOrden } from '../services/paypalService.js'

/**
 * 🛒 Crear una orden en PayPal
 */
export const createOrderController = async (req, res) => {
  try {
    const rawTotal = req.body?.total
    const total = parseFloat(rawTotal)

    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ El total enviado no es válido. Debe ser un número mayor a 0.'
      })
    }

    const orden = await crearOrden(total)

    return res.status(200).json({
      ok: true,
      message: '✅ Orden de PayPal creada exitosamente.',
      data: orden
    })
  } catch (error) {
    console.error('❌ Error en createOrderController:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error al crear la orden de PayPal.',
      error: error.message
    })
  }
}

/**
 * 💵 Capturar/Confirmar una orden en PayPal
 */
export const captureOrderController = async (req, res) => {
  try {
    const orderId = req.body?.orderId?.trim()

    if (!orderId || typeof orderId !== 'string' || orderId.length < 5) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ El orderId proporcionado no es válido.'
      })
    }

    const captura = await capturarOrden(orderId)

    return res.status(200).json({
      ok: true,
      message: '✅ Orden de PayPal capturada exitosamente.',
      data: captura
    })
  } catch (error) {
    console.error('❌ Error en captureOrderController:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error al capturar la orden de PayPal.',
      error: error.message
    })
  }
}
