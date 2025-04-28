import express from 'express';
import { crearOrden, capturarOrden } from '../services/paypalService.js';

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🎯 INTEGRACIÓN PAYPAL - RUTAS API                                           */
/* -------------------------------------------------------------------------- */

/**
 * 🛒 Crear una orden PayPal
 * POST /api/paypal/create-order
 * Body esperado: { total: número }
 */
router.post('/create-order', async (req, res) => {
  try {
    const { total } = req.body;

    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({ message: '⚠️ Total inválido o faltante.' });
    }

    const orden = await crearOrden(total);
    return res.status(200).json(orden);
  } catch (error) {
    console.error('❌ Error al crear orden PayPal:', error.message);
    return res.status(500).json({ message: 'Error al crear la orden PayPal.' });
  }
});

/**
 * 💵 Capturar una orden PayPal
 * POST /api/paypal/capture-order
 * Body esperado: { orderId: string }
 */
router.post('/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: '⚠️ orderId es requerido.' });
    }

    const captura = await capturarOrden(orderId);
    return res.status(200).json(captura);
  } catch (error) {
    console.error('❌ Error al capturar orden PayPal:', error.message);
    return res.status(500).json({ message: 'Error al capturar la orden PayPal.' });
  }
});

export default router;
