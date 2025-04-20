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
 * 🔓 Obtener promoción activa (PÚBLICO)
 * GET /api/promos
 */
router.get('/', getPromotion);

/**
 * 🔐 Crear/actualizar promoción (SOLO ADMIN)
 * PUT /api/promos
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
      .isISO8601().withMessage('⚠️ Fecha de fin inválida'),

    // ✅ Media opcional
    body('mediaUrl')
      .optional()
      .isString().withMessage('⚠️ mediaUrl debe ser texto'),

    body('mediaType')
      .optional()
      .isIn(['image', 'video']).withMessage('⚠️ mediaType debe ser "image" o "video"'),

    // ✅ Páginas donde se muestra
    body('pages')
      .optional()
      .isArray({ min: 1 }).withMessage('⚠️ Debes seleccionar al menos una página'),

    body('pages.*')
      .isIn(['home', 'categorias', 'productos', 'checkout', 'panel']).withMessage('⚠️ Página no válida'),

    // ✅ Posición en pantalla
    body('position')
      .optional()
      .isIn(['top', 'middle', 'bottom']).withMessage('⚠️ Posición no válida')
  ],
  updatePromotion
);

module.exports = router;
