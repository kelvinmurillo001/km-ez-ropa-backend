const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

// ✅ Controladores
const {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
} = require('../controllers/categoryController');

// 🔐 Middleware de autenticación (solo admins pueden modificar)
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// ============================
// 📥 Obtener todas las categorías (público)
// GET /api/categories
// ============================
router.get('/', getAllCategories);

// ============================
// ➕ Crear nueva categoría
// POST /api/categories
// ============================
router.post(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('name')
      .notEmpty().withMessage('⚠️ El nombre de la categoría es obligatorio')
      .isLength({ min: 2 }).withMessage('⚠️ Mínimo 2 caracteres'),

    body('subcategory')
      .optional()
      .isString().withMessage('⚠️ Subcategoría inválida')
  ],
  createCategory
);

// ============================
// ➕ Agregar subcategoría
// POST /api/categories/:categoryId/subcategories
// ============================
router.post(
  '/:categoryId/subcategories',
  authMiddleware,
  adminOnly,
  [
    param('categoryId').isMongoId().withMessage('⚠️ ID de categoría inválido'),
    body('subcategory')
      .notEmpty().withMessage('⚠️ La subcategoría es obligatoria')
      .isLength({ min: 2 }).withMessage('⚠️ Mínimo 2 caracteres')
  ],
  addSubcategory
);

// ============================
// 🗑️ Eliminar categoría
// DELETE /api/categories/:id
// ============================
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id').isMongoId().withMessage('⚠️ ID de categoría inválido')
  ],
  deleteCategory
);

// ============================
// 🗑️ Eliminar subcategoría
// DELETE /api/categories/:categoryId/subcategories/:subcategory
// ============================
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
