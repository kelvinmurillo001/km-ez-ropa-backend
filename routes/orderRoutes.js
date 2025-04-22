// 📁 routes/orderRoutes.js
import express from 'express'
import { body, param } from 'express-validator'

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

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 🛒 RUTAS DE PEDIDOS                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 🛍️ Crear nuevo pedido (PÚBLICO)
 */
router.post(
  '/',
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('⚠️ El pedido debe contener al menos un producto'),

    body('total').isFloat({ min: 0.01 }).withMessage('⚠️ El total debe ser un número mayor a 0'),

    body('nombreCliente')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('⚠️ El nombre del cliente es obligatorio')
      .isLength({ min: 2 })
      .withMessage('⚠️ Mínimo 2 caracteres'),

    body('email').optional().isEmail().withMessage('⚠️ Email inválido').normalizeEmail(),

    body('telefono')
      .optional()
      .isString()
      .withMessage('⚠️ El teléfono debe ser texto')
      .isLength({ min: 7, max: 20 })
      .withMessage('⚠️ Teléfono inválido'),

    body('nota')
      .optional()
      .trim()
      .escape()
      .isString()
      .withMessage('⚠️ La nota debe ser texto válido')
      .isLength({ max: 300 })
      .withMessage('⚠️ Nota demasiado larga')
  ],
  createOrder
)

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
  [
    param('id').isMongoId().withMessage('⚠️ ID de pedido inválido'),

    body('estado')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('⚠️ El estado es obligatorio')
      .isIn(['pendiente', 'en_proceso', 'enviado', 'cancelado'])
      .withMessage('⚠️ Estado no válido')
  ],
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
