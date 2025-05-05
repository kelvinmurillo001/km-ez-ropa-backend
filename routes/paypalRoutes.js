// 📁 routes/paypalRoutes.js

import express from 'express'
import {
  createOrderController,
  captureOrderController
} from '../controllers/paypalController.js'

// 🚀 Inicializar router
const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 💳 RUTAS DE INTEGRACIÓN CON PAYPAL                                         */
/* -------------------------------------------------------------------------- */

/**
 * @route   POST /api/paypal/create-order
 * @desc    Crea una nueva orden en PayPal
 * @access  Público
 */
router.post('/create-order', createOrderController)

/**
 * @route   POST /api/paypal/capture-order
 * @desc    Captura una orden aprobada de PayPal
 * @access  Público
 */
router.post('/capture-order', captureOrderController)

/* -------------------------------------------------------------------------- */
/* 📦 EXPORTAR                                                                */
/* -------------------------------------------------------------------------- */
export default router
