import { crearOrden, capturarOrden } from '../services/paypalService.js'

/* -------------------------------------------------------------------------- */
/* 🎯 CONTROLADOR DE PAYPAL                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 🛒 Crear una orden en PayPal
 */
export const createOrderController = async (req, res) => {
  try {
    const { total } = req.body

    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({ message: '⚠️ El total enviado no es válido.' })
    }

    const orden = await crearOrden(total)
    return res.status(200).json(orden)
  } catch (error) {
    console.error('❌ Error en createOrderController:', error.message)
    return res.status(500).json({ message: 'Error al crear la orden de PayPal.' })
  }
}

/**
 * 💵 Capturar/Confirmar una orden en PayPal
 */
export const captureOrderController = async (req, res) => {
  try {
    const { orderId } = req.body

    if (!orderId) {
      return res.status(400).json({ message: '⚠️ orderId es requerido.' })
    }

    const captura = await capturarOrden(orderId)
    return res.status(200).json(captura)
  } catch (error) {
    console.error('❌ Error en captureOrderController:', error.message)
    return res.status(500).json({ message: 'Error al capturar la orden de PayPal.' })
  }
}
