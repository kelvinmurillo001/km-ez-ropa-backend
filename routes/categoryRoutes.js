const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
} = require('../controllers/categoryController');

const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// 📦 Categorías

// 🔓 Obtener categorías (público)
router.get('/', getAllCategories);

// 🔐 Crear nueva categoría (solo admin)
router.post(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio')
  ],
  createCategory
);

// 🔐 Agregar subcategoría (solo admin)
router.post(
  '/:categoryId/subcategories',
  authMiddleware,
  adminOnly,
  [
    param('categoryId').notEmpty().withMessage('ID de categoría requerido'),
    body('subcategory').notEmpty().withMessage('Nombre de subcategoría requerido')
  ],
  addSubcategory
);

// 🔐 Eliminar categoría (solo admin)
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  param('id').notEmpty().withMessage('ID requerido'),
  deleteCategory
);

// 🔐 Eliminar subcategoría (solo admin)
router.delete(
  '/:categoryId/subcategories/:subcategory',
  authMiddleware,
  adminOnly,
  [
    param('categoryId').notEmpty().withMessage('ID de categoría requerido'),
    param('subcategory').notEmpty().withMessage('Subcategoría requerida')
  ],
  deleteSubcategory
);

module.exports = router;
