// 📁 routes/orderRoutes.js
import express from 'express'
import { param } from 'express-validator'

// 🧠 Controladores
import {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats
} from '../controllers/orderController.js'

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

// ✅ Validaciones centralizadas
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
router.post('/', createOrderValidation, createOrder)

/**
 * 📋 Obtener todos los pedidos (SOLO ADMIN)
 */
router.get('/', authMiddleware, adminOnly, getOrders)

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
 * 📊 Estadísticas de pedidos (DASHBOARD)
 */
router.get('/resumen', authMiddleware, adminOnly, getOrderStats)

/**
 * 📊 Alias para estadísticas de ventas (SOLO ADMIN)
 */
router.get('/stats/ventas', authMiddleware, adminOnly, getOrderStats)

export default router
