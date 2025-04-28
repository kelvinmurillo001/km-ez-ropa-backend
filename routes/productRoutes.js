// 📁 routes/productRoutes.js
import express from 'express'
import { param } from 'express-validator'

import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product/index.js'

import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

// ✅ Validaciones centralizadas
import {
  createProductValidation,
  updateProductValidation
} from '../validators/productValidator.js'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 📦 RUTAS DE PRODUCTOS                                                      */
/* -------------------------------------------------------------------------- */

/* ------------------------- 🔓 Rutas Públicas ------------------------------- */

/**
 * 📥 Obtener todos los productos (PÚBLICO)
 */
router.get('/', getAllProducts)

/**
 * 🔍 Obtener un producto por ID (PÚBLICO)
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('⚠️ ID de producto inválido')],
  getProductById
)

/* ------------------------ 🔐 Rutas Protegidas ------------------------------ */

/**
 * ➕ Crear producto (SOLO ADMIN)
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  createProductValidation,
  createProduct
)

/**
 * ✏️ Actualizar producto (SOLO ADMIN)
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  [param('id').isMongoId().withMessage('⚠️ ID de producto inválido')],
  updateProductValidation,
  updateProduct
)

/**
 * 🗑️ Eliminar producto (SOLO ADMIN)
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [param('id').isMongoId().withMessage('⚠️ ID inválido')],
  deleteProduct
)

export default router
