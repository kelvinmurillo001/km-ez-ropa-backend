const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getPromotion,
  updatePromotion
} = require('../controllers/promoController');

const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// 📢 Rutas de promociones

// 🔓 Obtener la promoción activa (pública)
router.get('/', getPromotion);

// 🔐 Actualizar promoción (solo admin)
router.put(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('message').optional().isString().withMessage('El mensaje debe ser texto'),
    body('theme').optional().isString(),
    body('active').optional().isBoolean(),
    body('startDate').optional().isISO8601().withMessage('Fecha inválida'),
    body('endDate').optional().isISO8601().withMessage('Fecha inválida')
  ],
  updatePromotion
);

module.exports = router;
