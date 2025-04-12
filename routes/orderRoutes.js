const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

// 🧠 Controladores
const {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats
} = require('../controllers/orderController');

// 🛡️ Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

/* -------------------------------------------------------------------------- */
/* 🛒 RUTAS DE PEDIDOS                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 📥 Crear pedido (PÚBLICO)
 * POST /api/orders
 */
router.post(
  '/',
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('⚠️ El pedido debe contener al menos un producto'),

    body('total')
      .isFloat({ min: 0.01 })
      .withMessage('⚠️ El total debe ser un número mayor a 0'),

    body('nombreCliente')
      .notEmpty()
      .isString()
      .isLength({ min: 2 })
      .withMessage('⚠️ El nombre del cliente es obligatorio y debe tener al menos 2 caracteres'),

    body('nota')
      .optional()
      .isString()
      .withMessage('⚠️ La nota debe ser texto válido')
  ],
  createOrder
);

/**
 * 📋 Obtener todos los pedidos (SOLO ADMIN)
 * GET /api/orders
 */
router.get('/', authMiddleware, adminOnly, getOrders);

/**
 * 🔄 Actualizar estado de un pedido (SOLO ADMIN)
 * PUT /api/orders/:id/estado
 */
router.put(
  '/:id/estado',
  authMiddleware,
  adminOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('⚠️ ID de pedido inválido'),

    body('estado')
      .notEmpty()
      .isString()
      .withMessage('⚠️ El estado es requerido y debe ser un string')
  ],
  actualizarEstadoPedido
);

/**
 * 📊 Obtener estadísticas de ventas (SOLO ADMIN)
 * GET /api/orders/stats/ventas
 */
router.get('/stats/ventas', authMiddleware, adminOnly, getOrderStats);

module.exports = router;
