import express from 'express'
import { param } from 'express-validator'

// 🧠 Controladores
import {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats,
  trackOrder,
  deleteOrder
} from '../controllers/orderController.js'

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

// ✅ Validaciones
import {
  createOrderValidation,
  updateOrderStatusValidation
} from '../validators/orderValidator.js'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 🛒 RUTAS DE PEDIDOS                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 🛍️ Crear nuevo pedido (PÚBLICO)
 */
router.post(
  '/',
  createOrderValidation,
  createOrder
)

/**
 * 📋 Obtener todos los pedidos (SOLO ADMIN)
 */
router.get(
  '/',
  authMiddleware,
  adminOnly,
  getOrders
)

/**
 * 🔄 Actualizar estado de un pedido (SOLO ADMIN)
 */
router.put(
  '/:id/estado',
  authMiddleware,
  adminOnly,
  updateOrderStatusValidation,
  actualizarEstadoPedido
)

/**
 * 🗑️ Eliminar pedido (SOLO ADMIN)
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
)

/**
 * 📊 Obtener estadísticas de pedidos (SOLO ADMIN)
 */
router.get(
  '/resumen',
  authMiddleware,
  adminOnly,
  getOrderStats
)

/**
 * 📊 Alias para resumen de ventas
 */
router.get(
  '/stats/ventas',
  authMiddleware,
  adminOnly,
  getOrderStats
)

/**
 * 🔎 Seguimiento de pedido por código (PÚBLICO)
 */
router.get(
  '/track/:codigo',
  [
    param('codigo')
      .notEmpty()
      .withMessage('⚠️ El código de seguimiento es obligatorio')
  ],
  trackOrder
)

// 🚀 Exportar router
export default router
