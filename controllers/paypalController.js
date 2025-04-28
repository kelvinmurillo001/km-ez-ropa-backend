// 📁 backend/controllers/paypalController.js

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

    if (!total || isNaN(total) || Number(total) <= 0) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ El total enviado no es válido.'
      })
    }

    const orden = await crearOrden(Number(total))
    return res.status(200).json({
      ok: true,
      message: '✅ Orden de PayPal creada exitosamente.',
      data: orden
    })
  } catch (error) {
    console.error('❌ Error en createOrderController:', error.message)
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
    const { orderId } = req.body

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({
        ok: false,
        message: '⚠️ El orderId enviado no es válido.'
      })
    }

    const captura = await capturarOrden(orderId.trim())
    return res.status(200).json({
      ok: true,
      message: '✅ Orden de PayPal capturada exitosamente.',
      data: captura
    })
  } catch (error) {
    console.error('❌ Error en captureOrderController:', error.message)
    return res.status(500).json({
      ok: false,
      message: '❌ Error al capturar la orden de PayPal.',
      error: error.message
    })
  }
}
