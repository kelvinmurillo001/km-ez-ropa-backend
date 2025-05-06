// 📁 routes/categoryRoutes.js
import express from 'express'
import { body, param } from 'express-validator'

// 🎯 Controladores
import {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
} from '../controllers/categoryController.js'

// 🛡️ Middlewares de autenticación y autorización
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

const router = express.Router()

/* ───────────────────────────────────────────── */
/* 🗂️ RUTAS: Categorías de productos             */
/* ───────────────────────────────────────────── */

/**
 * 📥 GET /
 * ➤ Obtener todas las categorías (PÚBLICO)
 */
router.get('/', getAllCategories)

/**
 * ➕ POST /
 * ➤ Crear nueva categoría (SOLO ADMIN)
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('name')
      .trim()
      .toLowerCase()
      .notEmpty().withMessage('⚠️ El nombre de la categoría es obligatorio')
      .isLength({ min: 2 }).withMessage('⚠️ Mínimo 2 caracteres en la categoría')
      .isLength({ max: 50 }).withMessage('⚠️ Máximo 50 caracteres permitidos'),

    body('subcategory')
      .optional()
      .trim()
      .toLowerCase()
      .isString().withMessage('⚠️ Subcategoría inválida')
      .isLength({ min: 2 }).withMessage('⚠️ La subcategoría debe tener al menos 2 caracteres')
      .isLength({ max: 50 }).withMessage('⚠️ Máximo 50 caracteres permitidos')
  ],
  createCategory
)

/**
 * ➕ POST /:categoryId/subcategories
 * ➤ Agregar subcategoría a una categoría (SOLO ADMIN)
 */
router.post(
  '/:categoryId/subcategories',
  authMiddleware,
  adminOnly,
  [
    param('categoryId')
      .isMongoId()
      .withMessage('⚠️ ID de categoría inválido'),

    body('subcategory')
      .trim()
      .toLowerCase()
      .notEmpty().withMessage('⚠️ La subcategoría es requerida')
      .isLength({ min: 2 }).withMessage('⚠️ La subcategoría debe tener al menos 2 caracteres')
      .isLength({ max: 50 }).withMessage('⚠️ Máximo 50 caracteres permitidos')
  ],
  addSubcategory
)

/**
 * 🗑️ DELETE /:id
 * ➤ Eliminar categoría completa (SOLO ADMIN)
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('⚠️ ID inválido')
  ],
  deleteCategory
)

/**
 * 🗑️ DELETE /:categoryId/subcategories/:subcategory
 * ➤ Eliminar una subcategoría específica (SOLO ADMIN)
 */
router.delete(
  '/:categoryId/subcategories/:subcategory',
  authMiddleware,
  adminOnly,
  [
    param('categoryId')
      .isMongoId()
      .withMessage('⚠️ ID de categoría inválido'),

    param('subcategory')
      .trim()
      .toLowerCase()
      .notEmpty().withMessage('⚠️ Subcategoría requerida')
      .isLength({ min: 2 }).withMessage('⚠️ La subcategoría debe tener al menos 2 caracteres')
      .isLength({ max: 50 }).withMessage('⚠️ Máximo 50 caracteres permitidos')
  ],
  deleteSubcategory
)

export default router
