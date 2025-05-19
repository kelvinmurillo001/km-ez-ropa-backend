// 📁 backend/routes/categoryRoutes.js
import express from 'express';
import { body, param } from 'express-validator';

// 🎯 Controladores
import {
  getAllCategories,
  createCategory,
  addSubcategory,
  deleteCategory,
  deleteSubcategory
} from '../controllers/categoryController.js';

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';
import validarErrores from '../middleware/validarErrores.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 🗂️ RUTAS DE CATEGORÍAS Y SUBCATEGORÍAS        */
/* ───────────────────────────────────────────── */

/**
 * 📥 GET /api/categories
 * ➤ Obtener todas las categorías (PÚBLICO)
 */
router.get('/', getAllCategories);

/**
 * ➕ POST /api/categories
 * ➤ Crear nueva categoría (SOLO ADMIN)
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('name')
      .trim().toLowerCase()
      .notEmpty().withMessage('⚠️ El nombre de la categoría es obligatorio')
      .isLength({ min: 2, max: 50 }).withMessage('⚠️ La categoría debe tener entre 2 y 50 caracteres'),

    body('subcategory')
      .optional()
      .trim().toLowerCase()
      .isString().withMessage('⚠️ Subcategoría inválida')
      .isLength({ min: 2, max: 50 }).withMessage('⚠️ La subcategoría debe tener entre 2 y 50 caracteres')
  ],
  validarErrores,
  createCategory
);

/**
 * ➕ POST /api/categories/:categoryId/subcategories
 * ➤ Agregar subcategoría (SOLO ADMIN)
 */
router.post(
  '/:categoryId/subcategories',
  authMiddleware,
  adminOnly,
  [
    param('categoryId')
      .isMongoId().withMessage('⚠️ ID de categoría inválido'),

    body('subcategory')
      .trim().toLowerCase()
      .notEmpty().withMessage('⚠️ La subcategoría es requerida')
      .isLength({ min: 2, max: 50 }).withMessage('⚠️ La subcategoría debe tener entre 2 y 50 caracteres')
  ],
  validarErrores,
  addSubcategory
);

/**
 * 🗑️ DELETE /api/categories/:id
 * ➤ Eliminar categoría completa (SOLO ADMIN)
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id')
      .isMongoId().withMessage('⚠️ ID de categoría inválido')
  ],
  validarErrores,
  deleteCategory
);

/**
 * 🗑️ DELETE /api/categories/:categoryId/subcategories/:subcategory
 * ➤ Eliminar subcategoría específica (SOLO ADMIN)
 */
router.delete(
  '/:categoryId/subcategories/:subcategory',
  authMiddleware,
  adminOnly,
  [
    param('categoryId')
      .isMongoId().withMessage('⚠️ ID de categoría inválido'),

    param('subcategory')
      .trim().toLowerCase()
      .notEmpty().withMessage('⚠️ Subcategoría requerida')
      .isLength({ min: 2, max: 50 }).withMessage('⚠️ La subcategoría debe tener entre 2 y 50 caracteres')
  ],
  validarErrores,
  deleteSubcategory
);

export default router;
