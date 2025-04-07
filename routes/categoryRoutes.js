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

// 🔓 Obtener todas las categorías (PÚBLICO)
router.get('/', getAllCategories);

// 🔐 Crear nueva categoría (ADMIN)
router.post(
  '/',
  authMiddleware,
  adminOnly,
  body('name').notEmpty().withMessage('El nombre es obligatorio'),
  createCategory
);

// 🔐 Agregar subcategoría a una categoría (ADMIN)
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

// 🔐 Eliminar categoría (ADMIN)
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  param('id').notEmpty().withMessage('ID requerido'),
  deleteCategory
);

// 🔐 Eliminar subcategoría de una categoría (ADMIN)
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
