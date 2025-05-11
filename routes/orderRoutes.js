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
/* 🛒 RUTAS: Gestión de Pedidos                  */
/* ───────────────────────────────────────────── */

/**
 * ➕ Crear nuevo pedido (PÚBLICO)
 */
router.post(
  '/',
  createOrderValidation,
  validarErrores,
  createOrder
);

/**
 * 📋 Obtener todos los pedidos (SOLO ADMIN)
 */
router.get(
  '/',
  authMiddleware,
  adminOnly,
  getOrders
);

/**
 * 👤 Obtener pedidos del cliente autenticado
 */
router.get(
  '/mis-pedidos',
  authMiddleware,
  clientOnly,
  getMyOrders
);

/**
 * 🔄 Actualizar estado de un pedido
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
 * 🗑️ Eliminar pedido por ID
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
 * 📊 Obtener resumen de estadísticas
 */
router.get(
  '/resumen',
  authMiddleware,
  adminOnly,
  getOrderStats
);

/**
 * 📊 Alias adicional para resumen
 */
router.get(
  '/stats/ventas',
  authMiddleware,
  adminOnly,
  getOrderStats
);

/**
 * 🔍 Seguimiento de pedido por código
 */
router.get(
  '/track/:codigo',
  [
    param('codigo')
      .notEmpty()
      .withMessage('⚠️ El código de seguimiento es obligatorio')
  ],
  validarErrores,
  trackOrder
);

export default router;
