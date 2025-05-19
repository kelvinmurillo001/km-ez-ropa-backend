// 📁 backend/routes/paypalRoutes.js

import express from 'express';

// ✅ Controladores y validaciones
import {
  createOrderController,
  captureOrderController,
  validateCreateOrder,
  validateCaptureOrder
} from '../controllers/paypalController.js';

import validarErrores from '../middleware/validarErrores.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 💵 RUTAS DE INTEGRACIÓN CON PAYPAL (Públicas) */
/* ───────────────────────────────────────────── */

/**
 * 🛒 POST /api/paypal/create-order
 * ➤ Crear una nueva orden PayPal
 * ➤ Público
 */
router.post(
  '/create-order',
  validateCreateOrder,
  validarErrores,
  createOrderController
);

/**
 * 💳 POST /api/paypal/capture-order
 * ➤ Capturar una orden ya creada en PayPal
 * ➤ Público
 */
router.post(
  '/capture-order',
  validateCaptureOrder,
  validarErrores,
  captureOrderController
);

export default router;
