const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

// 🧠 Controladores
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// 🔐 Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

/**
 * 📥 Obtener todos los productos (público)
 */
router.get('/', getAllProducts);

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

    body('variants')
      .isArray({ min: 1 }).withMessage('⚠️ Se requiere al menos una variante'),

    body('mainImages')
      .isArray({ min: 1 }).withMessage('⚠️ Se requiere al menos una imagen principal')
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

    body('variants')
      .optional()
      .isArray().withMessage('⚠️ Las variantes deben ser un array'),

    body('mainImages')
      .optional()
      .isArray().withMessage('⚠️ Las imágenes principales deben ser un array')
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
