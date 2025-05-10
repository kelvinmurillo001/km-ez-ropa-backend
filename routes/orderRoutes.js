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

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 🛒 RUTAS: Gestión de Pedidos                  */
/* ───────────────────────────────────────────── */

// 🛍️ Crear nuevo pedido (PÚBLICO)
router.post(
  '/',
  createOrderValidation,
  createOrder
);

// 📋 Obtener todos los pedidos (SOLO ADMIN)
router.get(
  '/',
  authMiddleware,
  adminOnly,
  getOrders
);

// ✅ Obtener pedidos del cliente autenticado
router.get(
  '/mis-pedidos',
  authMiddleware,
  clientOnly,
  getMyOrders
);

// 🔄 Actualizar estado de un pedido
router.put(
  '/:id/estado',
  authMiddleware,
  adminOnly,
  updateOrderStatusValidation,
  actualizarEstadoPedido
);

// 🗑️ Eliminar pedido por ID
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

// 📊 Obtener resumen de estadísticas de pedidos
router.get(
  '/resumen',
  authMiddleware,
  adminOnly,
  getOrderStats
);

// 📊 Alias para resumen de ventas
router.get(
  '/stats/ventas',
  authMiddleware,
  adminOnly,
  getOrderStats
);

// 🔎 Seguimiento de pedido por código
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
