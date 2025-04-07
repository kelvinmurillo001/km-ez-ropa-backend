const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// 📢 Controladores
const {
  getPromotion,
  updatePromotion
} = require('../controllers/promoController');

// 🛡️ Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// 📄 RUTAS DE PROMOCIONES

// 🔓 Obtener la promoción activa (PÚBLICO)
router.get('/', getPromotion);

// 🔐 Actualizar la promoción actual (ADMIN)
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
