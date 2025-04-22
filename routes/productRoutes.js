// 📁 routes/productRoutes.js
import express from 'express'
import { body, param } from 'express-validator'

import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product/index.js'

import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 📦 RUTAS DE PRODUCTOS                                                      */
/* -------------------------------------------------------------------------- */

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

/**
 * ➕ Crear producto (SOLO ADMIN)
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
      .withMessage('⚠️ El nombre del producto es obligatorio')
      .isLength({ min: 2, max: 100 })
      .withMessage('⚠️ Entre 2 y 100 caracteres'),

    body('price')
      .notEmpty()
      .withMessage('⚠️ El precio es obligatorio')
      .isFloat({ min: 0.01 })
      .withMessage('⚠️ El precio debe ser mayor a 0'),

    body('category').trim().escape().notEmpty().withMessage('⚠️ La categoría es obligatoria'),

    body('subcategory')
      .trim()
      .escape()
      .notEmpty()
      .withMessage('⚠️ La subcategoría es obligatoria')
      .isLength({ min: 2 })
      .withMessage('⚠️ Mínimo 2 caracteres en la subcategoría'),

    body('tallaTipo')
      .trim()
      .notEmpty()
      .withMessage('⚠️ El tipo de talla es obligatorio')
      .isIn(['adulto', 'niño', 'niña', 'bebé'])
      .withMessage('⚠️ Tipo de talla inválido'),

    body('images')
      .isArray({ min: 1, max: 1 })
      .withMessage('⚠️ Se requiere exactamente 1 imagen principal'),

    body('variants')
      .optional()
      .isArray({ max: 4 })
      .withMessage('⚠️ Máximo 4 variantes permitidas'),

    body('sizes')
      .optional()
      .isArray()
      .withMessage('⚠️ sizes debe ser un array')
  ],
  createProduct
)

/**
 * ✏️ Actualizar producto (SOLO ADMIN)
 */
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id').isMongoId().withMessage('⚠️ ID de producto inválido'),

    body('name')
      .optional()
      .trim()
      .escape()
      .isLength({ min: 2, max: 100 })
      .withMessage('⚠️ Nombre inválido'),

    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('⚠️ Precio inválido'),

    body('category')
      .optional()
      .trim()
      .escape()
      .isString()
      .withMessage('⚠️ Categoría inválida'),

    body('subcategory')
      .optional()
      .trim()
      .escape()
      .isString()
      .isLength({ min: 2 })
      .withMessage('⚠️ Subcategoría inválida'),

    body('tallaTipo')
      .optional()
      .trim()
      .isIn(['adulto', 'niño', 'niña', 'bebé'])
      .withMessage('⚠️ Tipo de talla inválido'),

    body('images')
      .optional()
      .isArray({ max: 1 })
      .withMessage('⚠️ Solo se permite una imagen principal'),

    body('variants')
      .optional()
      .isArray({ max: 4 })
      .withMessage('⚠️ Máximo 4 variantes permitidas'),

    body('sizes')
      .optional()
      .isArray()
      .withMessage('⚠️ sizes debe ser un array')
  ],
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
