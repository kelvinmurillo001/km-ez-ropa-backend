const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats
} = require('../controllers/orderController');

const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// 📥 Crear pedido (público o protegido si lo deseas)
router.post(
  '/',
  [
    body('cliente').notEmpty().withMessage('El nombre del cliente es obligatorio'),
    body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
    body('productos').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    body('total').isNumeric().withMessage('Total inválido')
  ],
  createOrder
);

// 🔐 Obtener todos los pedidos (solo admin)
router.get('/', authMiddleware, adminOnly, getOrders);

// 🔐 Cambiar estado de pedido (solo admin)
router.put('/:id/estado', authMiddleware, adminOnly, actualizarEstadoPedido);

// 📊 Estadísticas de pedidos (solo admin)
router.get('/stats/ventas', authMiddleware, adminOnly, getOrderStats);

module.exports = router;
