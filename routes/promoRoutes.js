const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

// 📢 Controladores
const {
  getPromotion,
  getAllPromotions,
  updatePromotion,
  togglePromoActive,
  deletePromotion
} = require('../controllers/promoController');

// 🛡️ Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// 📄 RUTAS DE PROMOCIONES

/**
 * 🔓 Obtener promociones activas y vigentes (PÚBLICO)
 * GET /api/promos
 */
router.get('/', getPromotion);

/**
 * 🔐 Obtener todas las promociones (ADMIN)
 * GET /api/promos/admin
 */
router.get('/admin', authMiddleware, adminOnly, getAllPromotions);

/**
 * 🔐 Crear o actualizar promoción
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

    body('mediaUrl')
      .optional()
      .isString().withMessage('⚠️ mediaUrl debe ser texto'),

    body('mediaType')
      .optional()
      .isIn(['image', 'video']).withMessage('⚠️ mediaType debe ser "image" o "video"'),

    body('pages')
      .optional()
      .isArray({ min: 1 }).withMessage('⚠️ Debes seleccionar al menos una página'),

    body('pages.*')
      .isIn(['home', 'categorias', 'productos', 'checkout', 'detalle', 'carrito']).withMessage('⚠️ Página no válida'),

    body('position')
      .optional()
      .isIn(['top', 'middle', 'bottom']).withMessage('⚠️ Posición no válida')
  ],
  updatePromotion
);

/**
 * 🔁 Activar/Desactivar promoción
 * PATCH /api/promos/:id/estado
 */
router.patch('/:id/estado', authMiddleware, adminOnly, togglePromoActive);

/**
 * 🗑️ Eliminar promoción
 * DELETE /api/promos/:id
 */
router.delete('/:id', authMiddleware, adminOnly, deletePromotion);

module.exports = router;
