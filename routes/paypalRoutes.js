// 📁 backend/routes/paypalRoutes.js
import express from 'express'
import {
  createOrderController,
  captureOrderController
} from '../controllers/paypalController.js'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 💳 RUTAS INTEGRACIÓN PAYPAL                                                */
/* -------------------------------------------------------------------------- */

/**
 * 🛒 Crear una orden de PayPal
 * POST /api/paypal/create-order
 */
router.post('/create-order', createOrderController)

/**
 * 💵 Capturar una orden de PayPal
 * POST /api/paypal/capture-order
 */
router.post('/capture-order', captureOrderController)

// 🚀 Exportar router
export default router
