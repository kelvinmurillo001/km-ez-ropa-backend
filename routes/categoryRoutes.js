const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

// 📦 Controladores
const {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
} = require('../controllers/categoryController');

// 🛡️ Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// 📄 RUTAS DE CATEGORÍAS

/**
 * 🔓 Obtener todas las categorías (PÚBLICO)
 * GET /api/categories
 */
router.get('/', getAllCategories);

/**
 * 🔐 Crear nueva categoría (ADMIN)
 * POST /api/categories
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('name')
      .trim()
      .notEmpty().withMessage('⚠️ El nombre es obligatorio')
      .isLength({ min: 2 }).withMessage('⚠️ El nombre debe tener al menos 2 caracteres')
  ],
  createCategory
);

/**
 * 🔐 Agregar subcategoría a una categoría (ADMIN)
 * POST /api/categories/:categoryId/subcategories
 */
router.post(
  '/:categoryId/subcategories',
  authMiddleware,
  adminOnly,
  [
    param('categoryId').isMongoId().withMessage('⚠️ ID de categoría inválido'),
    body('subcategory')
      .trim()
      .notEmpty().withMessage('⚠️ La subcategoría es requerida')
      .isLength({ min: 2 }).withMessage('⚠️ La subcategoría debe tener al menos 2 caracteres')
  ],
  addSubcategory
);

/**
 * 🔐 Eliminar categoría (ADMIN)
 * DELETE /api/categories/:id
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  param('id').isMongoId().withMessage('⚠️ ID inválido'),
  deleteCategory
);

/**
 * 🔐 Eliminar subcategoría específica (ADMIN)
 * DELETE /api/categories/:categoryId/subcategories/:subcategory
 */
router.delete(
  '/:categoryId/subcategories/:subcategory',
  authMiddleware,
  adminOnly,
  [
    param('categoryId').isMongoId().withMessage('⚠️ ID de categoría inválido'),
    param('subcategory').notEmpty().withMessage('⚠️ Subcategoría requerida')
  ],
  deleteSubcategory
);

module.exports = router;
