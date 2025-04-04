const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats
} = require('../controllers/orderController');

const authMiddleware = require('../middleware/authMiddleware');

// 📥 Crear pedido (público)
router.post('/', createOrder);

// 🔐 Obtener todos los pedidos (admin)
router.get('/', authMiddleware, getOrders);

// 🔐 Cambiar estado de pedido (admin)
router.put('/:id/estado', authMiddleware, actualizarEstadoPedido);

// 📊 Estadísticas de pedidos (opcional)
router.get('/stats/ventas', authMiddleware, getOrderStats);

module.exports = router;
