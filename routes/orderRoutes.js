const express = require('express')
const { body, param } = require('express-validator')
const router = express.Router()

// 🧠 Controladores
const {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats
} = require('../controllers/orderController')

// 🛡️ Middlewares
const authMiddleware = require('../middleware/authMiddleware')
const adminOnly = require('../middleware/adminOnly')

/* -------------------------------------------------------------------------- */
/* 🛒 RUTAS DE PEDIDOS                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 🛍️ Crear nuevo pedido (PÚBLICO)
 * POST /api/orders
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
 * GET /api/orders
 */
router.get('/', authMiddleware, adminOnly, getOrders)

/**
 * 🔄 Actualizar estado de un pedido (SOLO ADMIN)
 * PUT /api/orders/:id/estado
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
 * GET /api/orders/resumen
 */
router.get('/resumen', authMiddleware, adminOnly, getOrderStats)

/**
 * 📊 Alias para estadísticas de ventas (SOLO ADMIN)
 * GET /api/orders/stats/ventas
 */
router.get('/stats/ventas', authMiddleware, adminOnly, getOrderStats)

module.exports = router
