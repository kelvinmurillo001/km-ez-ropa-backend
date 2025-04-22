// 📁 routes/categoryRoutes.js
const express = require('express')
const { body, param } = require('express-validator')
const router = express.Router()

// 📦 Controladores
const {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
} = require('../controllers/categoryController')

// 🛡️ Middlewares de autenticación y autorización
const authMiddleware = require('../middleware/authMiddleware')
const adminOnly = require('../middleware/adminOnly')

/* -------------------------------------------------------------------------- */
/* 🗂️ RUTAS DE CATEGORÍAS                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 📥 Obtener todas las categorías (PÚBLICO)
 * GET /api/categories
 */
router.get('/', getAllCategories)

/**
 * ➕ Crear nueva categoría (SOLO ADMIN)
 * POST /api/categories
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('name')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('⚠️ El nombre de la categoría es obligatorio')
      .isLength({ min: 2 })
      .withMessage('⚠️ Mínimo 2 caracteres en la categoría'),

    body('subcategory')
      .optional()
      .trim()
      .escape()
      .isString()
      .withMessage('⚠️ Subcategoría inválida')
      .isLength({ min: 2 })
      .withMessage('⚠️ La subcategoría debe tener al menos 2 caracteres')
  ],
  createCategory
)

/**
 * ➕ Agregar subcategoría (SOLO ADMIN)
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
      .escape()
      .notEmpty()
      .withMessage('⚠️ La subcategoría es requerida')
      .isLength({ min: 2 })
      .withMessage('⚠️ La subcategoría debe tener al menos 2 caracteres')
  ],
  addSubcategory
)

/**
 * 🗑️ Eliminar categoría completa (SOLO ADMIN)
 * DELETE /api/categories/:id
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [param('id').isMongoId().withMessage('⚠️ ID inválido')],
  deleteCategory
)

/**
 * 🗑️ Eliminar subcategoría de una categoría (SOLO ADMIN)
 * DELETE /api/categories/:categoryId/subcategories/:subcategory
 */
router.delete(
  '/:categoryId/subcategories/:subcategory',
  authMiddleware,
  adminOnly,
  [
    param('categoryId').isMongoId().withMessage('⚠️ ID de categoría inválido'),

    param('subcategory').trim().escape().notEmpty().withMessage('⚠️ Subcategoría requerida')
  ],
  deleteSubcategory
)

// 🛠️ FUTURAS FUNCIONES:
// router.put('/:id', ...); // Editar nombre de categoría
// router.put('/:id/rename-subcategory', ...); // Renombrar subcategoría

module.exports = router
