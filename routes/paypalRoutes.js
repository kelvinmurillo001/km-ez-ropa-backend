// 📁 routes/paypalRoutes.js
import express from 'express';
import { crearOrden, capturarOrden } from '../services/paypalService.js';

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 💳 RUTAS INTEGRACIÓN PAYPAL                                                */
/* -------------------------------------------------------------------------- */

/**
 * 🛒 Crear una orden de PayPal
 * POST /api/paypal/create-order
 */
router.post('/create-order', async (req, res) => {
  try {
    const { total } = req.body;

    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Total inválido o faltante para crear la orden.'
      });
    }

    const orden = await crearOrden(total);
    return res.status(200).json({
      ok: true,
      orden
    });
  } catch (error) {
    console.error('❌ Error al crear orden PayPal:', error.message);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al crear la orden PayPal.',
      error: error.message
    });
  }
});

/**
 * 💵 Capturar una orden de PayPal
 * POST /api/paypal/capture-order
 */
router.post('/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ orderId es requerido para capturar la orden.'
      });
    }

    const captura = await capturarOrden(orderId);
    return res.status(200).json({
      ok: true,
      captura
    });
  } catch (error) {
    console.error('❌ Error al capturar orden PayPal:', error.message);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al capturar la orden PayPal.',
      error: error.message
    });
  }
});

// 🚀 Exportar router
export default router;
