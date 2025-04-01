// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();

const {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
} = require('../controllers/categoryController'); // Asegúrate que esta ruta y funciones existen

// 🧭 Routes
router.get('/', getAllCategories); // ✅ esto espera que getAllCategories esté definido
router.post('/', createCategory);
router.post('/:id/subcategories', addSubcategory);
router.delete('/:id', deleteCategory);
router.delete('/:id/subcategories', deleteSubcategory);

module.exports = router;
