// 📁 routes/promoRoutes.js
import express from 'express'
import { body, param } from 'express-validator'

// 🧠 Controladores
import {
  getPromotion,
  getAllPromotions,
  updatePromotion,
  togglePromoActive,
  deletePromotion
} from '../controllers/promoController.js'

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

const router = express.Router()

/* ───────────────────────────────────────────── */
/* 📄 RUTAS DE PROMOCIONES                       */
/* ───────────────────────────────────────────── */

/* 🔓 Públicas */

/**
 * 📢 GET /api/promos
 * ➤ Obtener promociones activas y vigentes
 */
router.get('/', getPromotion)

/* 🔐 Solo administrador */

/**
 * 📋 GET /api/promos/admin
 * ➤ Obtener todas las promociones
 */
router.get(
  '/admin',
  authMiddleware,
  adminOnly,
  getAllPromotions
)

/**
 * ✏️ PUT /api/promos
 * ➤ Crear o actualizar promoción
 */
router.put(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('message')
      .trim()
      .notEmpty().withMessage('⚠️ El mensaje de la promoción es obligatorio')
      .isLength({ min: 3 }).withMessage('⚠️ Debe tener al menos 3 caracteres'),

    body('theme')
      .optional()
      .isIn(['blue', 'orange', 'green', 'red'])
      .withMessage('⚠️ Tema no válido'),

    body('active')
      .optional()
      .isBoolean()
      .withMessage('⚠️ El campo "active" debe ser booleano'),

    body('startDate')
      .optional()
      .isISO8601()
      .withMessage('⚠️ Fecha de inicio inválida'),

    body('endDate')
      .optional()
      .isISO8601()
      .withMessage('⚠️ Fecha de fin inválida'),

    body('mediaUrl')
      .optional()
      .trim()
      .isString()
      .withMessage('⚠️ La mediaUrl debe ser una cadena de texto'),

    body('mediaType')
      .optional()
      .isIn(['image', 'video'])
      .withMessage('⚠️ mediaType debe ser "image" o "video"'),

    body('pages')
      .optional()
      .isArray({ min: 1 })
      .withMessage('⚠️ Debes seleccionar al menos una página válida'),

    body('pages.*')
      .isIn(['home', 'categorias', 'productos', 'checkout', 'detalle', 'carrito'])
      .withMessage('⚠️ Página no válida para promoción'),

    body('position')
      .optional()
      .isIn(['top', 'middle', 'bottom'])
      .withMessage('⚠️ Posición inválida')
  ],
  updatePromotion
)

/**
 * 🔁 PATCH /api/promos/:id/estado
 * ➤ Activar o desactivar una promoción
 */
router.patch(
  '/:id/estado',
  authMiddleware,
  adminOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('⚠️ ID de promoción inválido')
  ],
  togglePromoActive
)

/**
 * 🗑️ DELETE /api/promos/:id
 * ➤ Eliminar promoción por ID
 */
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    param('id')
      .isMongoId()
      .withMessage('⚠️ ID inválido para eliminar promoción')
  ],
  deletePromotion
)

export default router
