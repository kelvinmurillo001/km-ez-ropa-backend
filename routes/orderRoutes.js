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

// ✅ Validaciones
import {
  createOrderValidation,
  updateOrderStatusValidation
} from '../validators/orderValidator.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 🛒 RUTAS: Gestión de Pedidos                  */
/* ───────────────────────────────────────────── */

/**
 * 🛍️ POST /
 * ➤ Crear nuevo pedido (PÚBLICO)
 */
router.post(
  '/',
  createOrderValidation,
  createOrder
);

/**
 * 📋 GET /
 * ➤ Obtener todos los pedidos (SOLO ADMIN)
 */
router.get(
  '/',
  authMiddleware,
  adminOnly,
  getOrders
);

/**
 * ✅ GET /mis-pedidos
 * ➤ Pedidos del cliente autenticado (USUARIO REGISTRADO)
 */
router.get(
  '/mis-pedidos',
  authMiddleware,
  getMyOrders
);

/**
 * 🔄 PUT /:id/estado
 * ➤ Actualizar estado de un pedido (SOLO ADMIN)
 */
router.put(
  '/:id/estado',
  authMiddleware,
  adminOnly,
  updateOrderStatusValidation,
  actualizarEstadoPedido
);

/**
 * 🗑️ DELETE /:id
 * ➤ Eliminar pedido por ID (SOLO ADMIN)
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
  deleteOrder
);

/**
 * 📊 GET /resumen
 * ➤ Obtener resumen de estadísticas de pedidos (SOLO ADMIN)
 */
router.get(
  '/resumen',
  authMiddleware,
  adminOnly,
  getOrderStats
);

/**
 * 📊 GET /stats/ventas
 * ➤ Alias para obtener resumen de ventas (SOLO ADMIN)
 */
router.get(
  '/stats/ventas',
  authMiddleware,
  adminOnly,
  getOrderStats
);

/**
 * 🔎 GET /track/:codigo
 * ➤ Seguimiento de pedido por código de seguimiento (PÚBLICO)
 */
router.get(
  '/track/:codigo',
  [
    param('codigo')
      .notEmpty()
      .withMessage('⚠️ El código de seguimiento es obligatorio')
  ],
  trackOrder
);

export default router;
