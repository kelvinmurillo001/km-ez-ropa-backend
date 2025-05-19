// 📁 backend/routes/productRoutes.js

import express from 'express';
import { param } from 'express-validator';

// 🎯 Controladores
import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product/index.js';

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';
import validarErrores from '../middleware/validarErrores.js';

// ✅ Validaciones
import {
  createProductValidation,
  updateProductValidation
} from '../validators/productValidator.js';

import { filtroProductosValidator } from '../validators/filtroProductosValidator.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 📦 RUTAS DE PRODUCTOS                         */
/* ───────────────────────────────────────────── */

/**
 * 📥 GET /api/products
 * ➤ Obtener todos los productos con filtros (PÚBLICO)
 */
router.get(
  '/',
  filtroProductosValidator,
  validarErrores,
  getAllProducts
);

/**
 * 🔍 GET /api/products/slug/:slug
 * ➤ Obtener un producto por su slug
 */
router.get(
  '/slug/:slug',
  param('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('⚠️ Slug inválido'),
  validarErrores,
  getProductBySlug
);

/**
 * 🔍 GET /api/products/:id
 * ➤ Obtener un producto por ID
 */
router.get(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('⚠️ El ID proporcionado no es válido'),
  validarErrores,
  getProductById
);

/* 🔐 Rutas protegidas para administradores */

/**
 * ➕ POST /api/products
 * ➤ Crear un nuevo producto
 */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  createProductValidation,
  validarErrores,
  createProduct
);

/**
 * ✏️ PUT /api/products/:id
 * ➤ Actualizar un producto existente
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
);

/**
 * 🗑️ DELETE /api/products/:id
 * ➤ Eliminar un producto por ID
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
);

export default router;
