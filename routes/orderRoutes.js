const express = require('express');
const { body } = require('express-validator');
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

// 📦 RUTAS DE PEDIDOS

// 📥 Crear pedido (📢 PÚBLICO)
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

// 📋 Obtener todos los pedidos (🔐 SOLO ADMIN)
router.get('/', authMiddleware, adminOnly, getOrders);

// 🔄 Actualizar estado de pedido (🔐 SOLO ADMIN)
router.put('/:id/estado', authMiddleware, adminOnly, actualizarEstadoPedido);

// 📊 Obtener estadísticas de ventas (🔐 SOLO ADMIN)
router.get('/stats/ventas', authMiddleware, adminOnly, getOrderStats);

module.exports = router;
