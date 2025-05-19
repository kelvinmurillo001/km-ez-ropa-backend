// 📁 backend/routes/orderRoutes.js
import express from 'express';
import { param } from 'express-validator';

// 🎯 Controladores
import {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats,
  trackOrder,
  deleteOrder,
  getMyOrders
} from '../controllers/orderController.js';

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';
import clientOnly from '../middleware/clientOnly.js';

// ✅ Validaciones
import {
  createOrderValidation,
  updateOrderStatusValidation
} from '../validators/orderValidator.js';

import validarErrores from '../middleware/validarErrores.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 🛒 RUTAS PARA PEDIDOS                         */
/* ───────────────────────────────────────────── */

/**
 * ➕ POST /api/orders
 * ➤ Crear nuevo pedido (PÚBLICO)
 */
router.post(
  '/',
  createOrderValidation,
  validarErrores,
  createOrder
);

/**
 * 📋 GET /api/orders
 * ➤ Obtener todos los pedidos (ADMIN)
 */
router.get(
  '/',
  authMiddleware,
  adminOnly,
  getOrders
);

/**
 * 👤 GET /api/orders/mis-pedidos
 * ➤ Obtener pedidos del cliente autenticado
 */
router.get(
  '/mis-pedidos',
  authMiddleware,
  clientOnly,
  getMyOrders
);

/**
 * 🔄 PUT /api/orders/:id/estado
 * ➤ Actualizar estado del pedido (ADMIN)
 */
router.put(
  '/:id/estado',
  authMiddleware,
  adminOnly,
  updateOrderStatusValidation,
  validarErrores,
  actualizarEstadoPedido
);

/**
 * 🗑️ DELETE /api/orders/:id
 * ➤ Eliminar un pedido por ID (ADMIN)
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('⚠️ ID de pedido inválido')
  ],
  validarErrores,
  deleteOrder
);

/**
 * 📊 GET /api/orders/resumen
 * ➤ Obtener resumen de estadísticas (ADMIN)
 */
router.get(
  '/resumen',
  authMiddleware,
  adminOnly,
  getOrderStats
);

/**
 * 📊 GET /api/orders/stats/ventas
 * ➤ Alias para estadísticas (ADMIN)
 */
router.get(
  '/stats/ventas',
  authMiddleware,
  adminOnly,
  getOrderStats
);

/**
 * 🔍 GET /api/orders/track/:codigo
 * ➤ Consultar estado por código de seguimiento (PÚBLICO)
 */
router.get(
  '/track/:codigo',
  [
    param('codigo')
      .notEmpty()
      .withMessage('⚠️ Código de seguimiento requerido')
  ],
  validarErrores,
  trackOrder
);

export default router;
