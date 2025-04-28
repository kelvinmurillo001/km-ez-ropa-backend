import express from 'express';
import { crearOrden, capturarOrden } from '../services/paypalService.js';

const router = express.Router();

// 🛒 Crear orden PayPal
router.post('/create-order', async (req, res) => {
  try {
    const { total } = req.body;
    const orden = await crearOrden(total);
    res.json(orden);
  } catch (error) {
    console.error('❌ Error al crear orden PayPal:', error.message);
    res.status(500).json({ message: 'Error al crear orden PayPal' });
  }
});

// 💵 Capturar orden PayPal
router.post('/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    const captura = await capturarOrden(orderId);
    res.json(captura);
  } catch (error) {
    console.error('❌ Error al capturar orden PayPal:', error.message);
    res.status(500).json({ message: 'Error al capturar orden PayPal' });
  }
});

export default router;
