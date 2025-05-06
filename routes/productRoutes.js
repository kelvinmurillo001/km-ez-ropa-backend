// 📁 backend/routes/productRoutes.js
import express from 'express'
import { param } from 'express-validator'

// 🧠 Controladores
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/products/index.js'

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'
import validarErrores from '../middleware/validarErrores.js'

// ✅ Validaciones
import {
  createProductValidation,
  updateProductValidation
} from '../validators/productValidator.js'
import { filtroProductosValidator } from '../validators/filtroProductosValidator.js'

const router = express.Router()

/* ───────────────────────────────────────────── */
/* 📦 RUTAS DE PRODUCTOS                         */
/* ───────────────────────────────────────────── */

/* 🔓 Rutas públicas */

/**
 * 📥 GET /api/products
 * ➤ Obtener productos con filtros (catálogo)
 */
router.get(
  '/',
  filtroProductosValidator,
  validarErrores,
  getAllProducts
)

/**
 * 🔍 GET /api/products/slug/:slug
 * ➤ Obtener producto por slug
 */
router.get(
  '/slug/:slug',
  param('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('⚠️ Slug inválido'),
  validarErrores,
  getProductBySlug
)

/**
 * 🔍 GET /api/products/:id
 * ➤ Obtener producto por ID
 */
router.get(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('⚠️ El ID proporcionado no es válido'),
  validarErrores,
  getProductById
)

/* 🔐 Rutas privadas (Solo Admin) */

/**
 * ➕ POST /api/products
 * ➤ Crear nuevo producto
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  createProductValidation,
  validarErrores,
  createProduct
)

/**
 * ✏️ PUT /api/products/:id
 * ➤ Actualizar producto existente
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id').isMongoId().withMessage('⚠️ ID inválido'),
    ...updateProductValidation
  ],
  validarErrores,
  updateProduct
)

/**
 * 🗑️ DELETE /api/products/:id
 * ➤ Eliminar producto
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  param('id')
    .isMongoId()
    .withMessage('⚠️ ID inválido'),
  validarErrores,
  deleteProduct
)

export default router
