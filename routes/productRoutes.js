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

// 🔧 Validadores reutilizables
const validarId = param('id')
  .isMongoId()
  .withMessage('⚠️ El ID proporcionado no es válido');

const validarSlug = param('slug')
  .matches(/^[a-z0-9-]+$/)
  .withMessage('⚠️ Slug inválido');

// ──────────────── 📦 RUTAS PÚBLICAS ────────────────

router.get('/', filtroProductosValidator, validarErrores, getAllProducts);

router.get('/slug/:slug', validarSlug, validarErrores, getProductBySlug);

router.get('/:id', validarId, validarErrores, getProductById);

// ─────────────── 🔐 RUTAS ADMIN PROTEGIDAS ───────────────

router.post(
  '/',
  authMiddleware,
  adminOnly,
  createProductValidation,
  validarErrores,
  createProduct
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  [validarId, ...updateProductValidation],
  validarErrores,
  updateProduct
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  validarId,
  validarErrores,
  deleteProduct
);

export default router;
