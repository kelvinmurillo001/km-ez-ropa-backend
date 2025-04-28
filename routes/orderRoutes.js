// 📁 routes/orderRoutes.js
import express from 'express';
import { param } from 'express-validator';

// 🧠 Controladores
import {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats,
  trackOrder
} from '../controllers/ordersController.js'; // <- (Ojo, es ordersController.js)

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';

// ✅ Validaciones centralizadas
import {
  createOrderValidation,
  updateOrderStatusValidation
} from '../validators/orderValidator.js';

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🛒 RUTAS DE PEDIDOS                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 🛍️ Crear nuevo pedido (PÚBLICO)
 */
router.post('/', createOrderValidation, createOrder);

/**
 * 📋 Obtener todos los pedidos (SOLO ADMIN)
 */
router.get('/', authMiddleware, adminOnly, getOrders);

/**
 * 🔄 Actualizar estado de un pedido (SOLO ADMIN)
 */
router.put(
  '/:id/estado',
  authMiddleware,
  adminOnly,
  updateOrderStatusValidation,
  actualizarEstadoPedido
);

/**
 * 📊 Obtener estadísticas de pedidos (SOLO ADMIN)
 */
router.get('/resumen', authMiddleware, adminOnly, getOrderStats);

/**
 * 📊 Alias de estadísticas de ventas (SOLO ADMIN)
 */
router.get('/stats/ventas', authMiddleware, adminOnly, getOrderStats);

/**
 * 🔎 Seguimiento de pedido (PÚBLICO)
 */
router.get('/track/:codigo', trackOrder); // <- ESTA ES LA NUEVA RUTA para seguimiento

export default router;
