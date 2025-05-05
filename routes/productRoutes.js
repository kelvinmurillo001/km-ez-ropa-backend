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
} from '../controllers/product/index.js'

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

/* -------------------------------------------------------------------------- */
/* 📦 RUTAS DE PRODUCTOS                                                      */
/* -------------------------------------------------------------------------- */

/* ------------------------- 🔓 Rutas Públicas ------------------------------- */

/**
 * 📥 Obtener todos los productos (catálogo público o panel)
 * Query: nombre, categoria, subcategoria, precioMin, precioMax, featured, pagina, limite
 */
router.get(
  '/',
  filtroProductosValidator,
  validarErrores,
  getAllProducts
)

/**
 * 🔍 Obtener producto por ID
 */
router.get(
  '/:id',
  param('id').isMongoId().withMessage('⚠️ El ID proporcionado no es válido'),
  validarErrores,
  getProductById
)

/**
 * 🔍 Obtener producto por SLUG
 */
router.get(
  '/slug/:slug',
  getProductBySlug
)

/* ------------------------- 🔐 Rutas Privadas (Solo Admin) ------------------ */

/**
 * ➕ Crear producto
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
 * ✏️ Actualizar producto
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
 * 🗑️ Eliminar producto
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  param('id').isMongoId().withMessage('⚠️ ID inválido'),
  validarErrores,
  deleteProduct
)

export default router
