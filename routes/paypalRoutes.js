// 📁 routes/paypalRoutes.js

import express from 'express'
import {
  createOrderController,
  captureOrderController
} from '../controllers/paypalController.js'

const router = express.Router()

/* ───────────────────────────────────────────── */
/* 💳 RUTAS: Integración con PayPal              */
/* ───────────────────────────────────────────── */

/**
 * 🛒 POST /api/paypal/create-order
 * ➤ Crea una nueva orden de pago en PayPal
 * @access Público
 */
router.post('/create-order', createOrderController)

/**
 * ✅ POST /api/paypal/capture-order
 * ➤ Captura una orden aprobada de PayPal
 * @access Público
 */
router.post('/capture-order', captureOrderController)

export default router
