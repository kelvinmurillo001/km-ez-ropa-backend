const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

// ✅ Controladores centralizados desde index.js
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product');

// 🔐 Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

/**
 * 📥 Obtener todos los productos (público)
 */
router.get('/', getAllProducts);

/**
 * 🔍 Obtener producto por ID (público)
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('⚠️ ID inválido')
], getProductById);

/**
 * ➕ Crear producto (solo admin)
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('name')
      .notEmpty().withMessage('⚠️ El nombre es obligatorio')
      .isLength({ min: 2, max: 100 }).withMessage('⚠️ El nombre debe tener entre 2 y 100 caracteres'),

    body('price')
      .notEmpty().withMessage('⚠️ El precio es obligatorio')
      .isFloat({ min: 0.01 }).withMessage('⚠️ El precio debe ser mayor a 0'),

    body('category')
      .notEmpty().withMessage('⚠️ La categoría es obligatoria'),

    body('subcategory')
      .notEmpty().withMessage('⚠️ La subcategoría es obligatoria'),

    body('tallaTipo')
      .notEmpty().withMessage('⚠️ El tipo de talla es obligatorio'),

    body('stock')
      .notEmpty().withMessage('⚠️ El stock es obligatorio')
      .isInt({ min: 0 }).withMessage('⚠️ El stock debe ser un número igual o mayor a 0'),

    body('images')
      .isArray({ min: 1, max: 1 }).withMessage('⚠️ Debes subir exactamente 1 imagen principal'),

    body('variants')
      .optional()
      .isArray({ max: 4 }).withMessage('⚠️ Se permiten hasta 4 variantes como máximo')
  ],
  createProduct
);

/**
 * ✏️ Actualizar producto (solo admin)
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id').isMongoId().withMessage('⚠️ ID inválido'),

    body('name')
      .optional()
      .isLength({ min: 2, max: 100 }).withMessage('⚠️ Nombre inválido'),

    body('price')
      .optional()
      .isFloat({ min: 0 }).withMessage('⚠️ Precio inválido'),

    body('stock')
      .optional()
      .isInt({ min: 0 }).withMessage('⚠️ Stock inválido'),

    body('images')
      .optional()
      .isArray({ max: 1 }).withMessage('⚠️ Solo se permite una imagen principal'),

    body('variants')
      .optional()
      .isArray({ max: 4 }).withMessage('⚠️ Máximo 4 variantes permitidas')
  ],
  updateProduct
);

/**
 * 🗑️ Eliminar producto (solo admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id').isMongoId().withMessage('⚠️ ID inválido')
  ],
  deleteProduct
);

module.exports = router;
