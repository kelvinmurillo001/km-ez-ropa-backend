// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();

const {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
} = require('../controllers/categoryController');

const authMiddleware = require('../middleware/authMiddleware');

// 📦 Rutas de categorías

// 🔓 Obtener categorías (público o protegido si quieres)
router.get('/', getAllCategories);

// 🔐 Crear nueva categoría
router.post('/', authMiddleware, createCategory);

// 🔐 Agregar subcategoría a categoría existente
router.post('/:categoryId/subcategories', authMiddleware, addSubcategory);

// 🔐 Eliminar categoría
router.delete('/:id', authMiddleware, deleteCategory);

// 🔐 Eliminar subcategoría específica (se pasa por query param o body)
router.delete('/:categoryId/subcategories/:subcategory', authMiddleware, deleteSubcategory);

module.exports = router;
