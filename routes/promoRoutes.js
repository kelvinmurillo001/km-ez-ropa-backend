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

/**
 * 🔓 Obtener promociones activas y vigentes (PÚBLICO)
 * GET /api/promotions
 */
router.get('/', getPromotion);

/**
 * 🔐 Crear una nueva promoción (SOLO ADMIN)
 * PUT /api/promotions
 */
router.put(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('message')
      .exists().withMessage('⚠️ El mensaje es obligatorio')
      .isString().withMessage('⚠️ El mensaje debe ser texto')
      .isLength({ min: 3 }).withMessage('⚠️ El mensaje debe tener al menos 3 caracteres'),

    body('theme')
      .optional()
      .isIn(['blue', 'orange', 'green', 'red']).withMessage('⚠️ Tema no válido'),

    body('active')
      .optional()
      .isBoolean().withMessage('⚠️ El campo active debe ser booleano'),

    body('startDate')
      .optional()
      .isISO8601().withMessage('⚠️ Fecha de inicio inválida'),

    body('endDate')
      .optional()
      .isISO8601().withMessage('⚠️ Fecha de fin inválida')
  ],
  updatePromotion
);

module.exports = router;
