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

/* -------------------------------------------------------------------------- */
/* 📦 RUTAS DE PRODUCTOS                                                      */
/* -------------------------------------------------------------------------- */

/* ------------------------- 🔓 Rutas Públicas ------------------------------- */

/**
 * 📥 Obtener todos los productos (catálogo público o panel)
 * Query: nombre, categoria, subcategoria, precioMin, precioMax, featured, pagina, limite
 */
router.get('/', getAllProducts)

/**
 * 🔍 Obtener producto por ID (validación segura)
 */
router.get(
  '/:id',
  param('id')
    .isMongoId().withMessage('⚠️ El ID proporcionado no es válido'),
  getProductById
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
  createProduct
)

/**
 * ✏️ Actualizar producto por ID
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id')
      .isMongoId().withMessage('⚠️ El ID proporcionado no es válido'),
    ...updateProductValidation
  ],
  updateProduct
)

/**
 * 🗑️ Eliminar producto por ID
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  param('id')
    .isMongoId().withMessage('⚠️ ID inválido'),
  deleteProduct
)

export default router
