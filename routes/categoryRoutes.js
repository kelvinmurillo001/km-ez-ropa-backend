// 📁 routes/categoryRoutes.js
import express from 'express'
import { body, param } from 'express-validator'

// 📦 Controladores
import {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
} from '../controllers/categoryController.js'

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 🗂️ RUTAS DE CATEGORÍAS                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 📥 Obtener todas las categorías (PÚBLICO)
 */
router.get('/', getAllCategories)

/**
 * ➕ Crear nueva categoría (SOLO ADMIN)
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
 */
router.delete(
  '/:categoryId/subcategories/:subcategory',
  authMiddleware,
  adminOnly,
  [
    param('categoryId').isMongoId().withMessage('⚠️ ID de categoría inválido'),
    param('subcategory')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('⚠️ Subcategoría requerida')
  ],
  deleteSubcategory
)

export default router
