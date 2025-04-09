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

// 📦 Rutas de Productos

/**
 * 📥 Obtener todos los productos (Público)
 */
router.get('/', getAllProducts);

/**
 * ➕ Crear nuevo producto (Solo Admin)
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('El nombre es obligatorio')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

    body('price')
      .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número válido'),

    body('category')
      .trim()
      .notEmpty().withMessage('La categoría es obligatoria'),

    body('subcategory')
      .trim()
      .notEmpty().withMessage('La subcategoría es obligatoria'),

    body('variants')
      .isArray({ min: 1 }).withMessage('Se requiere al menos una variante')
  ],
  createProduct
);

/**
 * ✏️ Actualizar producto existente (Solo Admin)
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id').isMongoId().withMessage('ID inválido'),

    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Nombre inválido'),

    body('price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Precio inválido'),

    body('variants')
      .optional()
      .isArray().withMessage('Las variantes deben ser un array')
  ],
  updateProduct
);

/**
 * 🗑️ Eliminar producto (Solo Admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id').isMongoId().withMessage('ID inválido')
  ],
  deleteProduct
);

module.exports = router;
