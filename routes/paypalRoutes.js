// 📁 backend/routes/paypalRoutes.js
import express from 'express';

// ✅ Controladores y validaciones
import {
  createOrderController,
  captureOrderController,
  validateCreateOrder,
  validateCaptureOrder
} from '../controllers/paypalController.js';

// ✅ Middleware para validar errores de express-validator
import validarErrores from '../middleware/validarErrores.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 💵 RUTAS DE INTEGRACIÓN CON PAYPAL            */
/* ───────────────────────────────────────────── */

/**
 * 🛒 POST /api/paypal/create-order
 * ➤ Crea una orden de PayPal
 * @access Público
 */
router.post(
  '/create-order',
  validateCreateOrder,
  validarErrores,
  createOrderController
);

/**
 * 💳 POST /api/paypal/capture-order
 * ➤ Captura una orden PayPal existente
 * @access Público
 */
router.post(
  '/capture-order',
  validateCaptureOrder,
  validarErrores,
  captureOrderController
);

export default router;
