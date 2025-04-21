const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

// ✅ Controladores
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

/* -------------------------------------------------------------------------- */
/* 📦 RUTAS DE PRODUCTOS                                                      */
/* -------------------------------------------------------------------------- */

/**
 * 📥 Obtener todos los productos (PÚBLICO)
 * GET /api/products
 */
router.get('/', getAllProducts);

/**
 * 🔍 Obtener un producto por ID (PÚBLICO)
 * GET /api/products/:id
 */
router.get(
  '/:id',
  [
    param('id')
      .isMongoId()
      .withMessage('⚠️ ID inválido')
  ],
  getProductById
);

/**
 * ➕ Crear producto (SOLO ADMIN)
 * POST /api/products
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('name')
      .notEmpty().withMessage('⚠️ El nombre es obligatorio')
      .isLength({ min: 2, max: 100 }).withMessage('⚠️ Debe tener entre 2 y 100 caracteres'),

    body('price')
      .notEmpty().withMessage('⚠️ El precio es obligatorio')
      .isFloat({ min: 0.01 }).withMessage('⚠️ Debe ser mayor a 0'),

    body('category')
      .notEmpty().withMessage('⚠️ La categoría es obligatoria'),

    body('subcategory')
      .notEmpty().withMessage('⚠️ La subcategoría es obligatoria')
      .isLength({ min: 2 }).withMessage('⚠️ Mínimo 2 caracteres en la subcategoría'),

    body('tallaTipo')
      .notEmpty().withMessage('⚠️ El tipo de talla es obligatorio')
      .isIn(['adulto', 'niño', 'niña', 'bebé']).withMessage('⚠️ Tipo de talla inválido'),

    body('images')
      .isArray({ min: 1, max: 1 }).withMessage('⚠️ Exactamente 1 imagen principal'),

    body('variants')
      .optional()
      .isArray({ max: 4 }).withMessage('⚠️ Máximo 4 variantes permitidas'),

    body('sizes')
      .optional()
      .isArray().withMessage('⚠️ El campo sizes debe ser un array de tallas')
  ],
  createProduct
);

/**
 * ✏️ Actualizar producto (SOLO ADMIN)
 * PUT /api/products/:id
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id')
      .isMongoId().withMessage('⚠️ ID inválido'),

    body('name')
      .optional()
      .isLength({ min: 2, max: 100 }).withMessage('⚠️ Nombre inválido'),

    body('price')
      .optional()
      .isFloat({ min: 0 }).withMessage('⚠️ Precio inválido'),

    body('category')
      .optional()
      .isString().withMessage('⚠️ Categoría inválida'),

    body('subcategory')
      .optional()
      .isString().isLength({ min: 2 }).withMessage('⚠️ Subcategoría inválida'),

    body('tallaTipo')
      .optional()
      .isIn(['adulto', 'niño', 'niña', 'bebé']).withMessage('⚠️ Tipo de talla inválido'),

    body('images')
      .optional()
      .isArray({ max: 1 }).withMessage('⚠️ Solo 1 imagen principal permitida'),

    body('variants')
      .optional()
      .isArray({ max: 4 }).withMessage('⚠️ Máximo 4 variantes permitidas'),

    body('sizes')
      .optional()
      .isArray().withMessage('⚠️ El campo sizes debe ser un array de tallas')
  ],
  updateProduct
);

/**
 * 🗑️ Eliminar producto (SOLO ADMIN)
 * DELETE /api/products/:id
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id')
      .isMongoId().withMessage('⚠️ ID inválido')
  ],
  deleteProduct
);

module.exports = router;
