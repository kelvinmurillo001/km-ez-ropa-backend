const express = require('express');
const { body, param } = require('express-validator');
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

/* -------------------------------------------------------------------------- */
/* 📄 RUTAS DE PROMOCIONES                                                    */
/* -------------------------------------------------------------------------- */

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
      .trim()
      .notEmpty().withMessage('⚠️ El mensaje de la promoción es obligatorio')
      .isLength({ min: 3 }).withMessage('⚠️ Debe tener al menos 3 caracteres'),

    body('theme')
      .optional()
      .isIn(['blue', 'orange', 'green', 'red']).withMessage('⚠️ Tema no válido'),

    body('active')
      .optional()
      .isBoolean().withMessage('⚠️ El campo "active" debe ser booleano'),

    body('startDate')
      .optional()
      .isISO8601().withMessage('⚠️ Fecha de inicio inválida'),

    body('endDate')
      .optional()
      .isISO8601().withMessage('⚠️ Fecha de fin inválida'),

    body('mediaUrl')
      .optional()
      .trim()
      .isString().withMessage('⚠️ La mediaUrl debe ser una cadena de texto'),

    body('mediaType')
      .optional()
      .isIn(['image', 'video']).withMessage('⚠️ mediaType debe ser "image" o "video"'),

    body('pages')
      .optional()
      .isArray({ min: 1 }).withMessage('⚠️ Debes seleccionar al menos una página'),

    body('pages.*')
      .isIn(['home', 'categorias', 'productos', 'checkout', 'detalle', 'carrito'])
      .withMessage('⚠️ Página no válida para promoción'),

    body('position')
      .optional()
      .isIn(['top', 'middle', 'bottom']).withMessage('⚠️ Posición inválida')
  ],
  updatePromotion
);

/**
 * 🔁 Activar o desactivar promoción
 * PATCH /api/promos/:id/estado
 */
router.patch(
  '/:id/estado',
  authMiddleware,
  adminOnly,
  [
    param('id').isMongoId().withMessage('⚠️ ID de promoción inválido')
  ],
  togglePromoActive
);

/**
 * 🗑️ Eliminar una promoción
 * DELETE /api/promos/:id
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id').isMongoId().withMessage('⚠️ ID inválido para eliminar promoción')
  ],
  deletePromotion
);

module.exports = router;
