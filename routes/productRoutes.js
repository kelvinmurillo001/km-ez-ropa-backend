// 📁 routes/productRoutes.js
import express from 'express'
import { param } from 'express-validator'

// 🧠 Controladores
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product/index.js'

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

// ✅ Validaciones
import {
  createProductValidation,
  updateProductValidation
} from '../validators/productValidator.js'

const router = express.Router()

/* ──────────────────────────────────────────────────────────────────────────── */
/* 📦 RUTAS DE PRODUCTOS                                                       */
/* ──────────────────────────────────────────────────────────────────────────── */

/* ------------------------- 🔓 Rutas Públicas -------------------------------- */

/**
 * 📥 Obtener todos los productos (catálogo y panel público)
 * Query params soportados:
 * - nombre
 * - categoria
 * - subcategoria
 * - precioMin / precioMax
 * - featured
 * - pagina / limite
 */
router.get('/', getAllProducts)

/**
 * 🔍 Obtener un producto por ID
 * Público pero validado como ObjectId
 */
router.get(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('⚠️ El ID proporcionado no es válido'),
  getProductById
)

/* ------------------------- 🔐 Rutas Privadas -------------------------------- */

/**
 * ➕ Crear un nuevo producto
 * Solo accesible por administradores autenticados
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  createProductValidation,
  createProduct
)

/**
 * ✏️ Actualizar producto por ID
 * Solo admins autenticados
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('⚠️ El ID proporcionado no es válido')
  ],
  updateProductValidation,
  updateProduct
)

/**
 * 🗑️ Eliminar producto por ID (y sus imágenes)
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  param('id')
    .isMongoId()
    .withMessage('⚠️ ID inválido'),
  deleteProduct
)

export default router
