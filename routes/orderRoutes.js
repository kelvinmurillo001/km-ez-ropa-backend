const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrders,
  actualizarEstadoPedido
} = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getOrders);
router.put('/:id/estado', actualizarEstadoPedido);

module.exports = router;
