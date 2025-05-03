// 📁 backend/controllers/paypalController.js
import { crearOrden, capturarOrden } from '../services/paypalService.js'

/**
 * 🛒 Crear una orden en PayPal
 * @route POST /api/paypal/create-order
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

    if (!orden?.id) {
      return res.status(502).json({
        ok: false,
        message: '⚠️ No se pudo crear la orden en PayPal.',
        error: orden?.message || null
      })
    }

    return res.status(200).json({
      ok: true,
      message: '✅ Orden de PayPal creada exitosamente.',
      data: orden
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error en createOrderController:', error)
    }

    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al crear la orden de PayPal.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * 💵 Capturar una orden en PayPal
 * @route POST /api/paypal/capture-order
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

    if (!captura?.status || captura.status.toUpperCase() !== 'COMPLETED') {
      return res.status(502).json({
        ok: false,
        message: '⚠️ La captura de la orden no fue exitosa.',
        status: captura?.status || 'desconocido'
      })
    }

    return res.status(200).json({
      ok: true,
      message: '✅ Orden de PayPal capturada exitosamente.',
      data: captura
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error en captureOrderController:', error)
    }

    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al capturar la orden de PayPal.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
