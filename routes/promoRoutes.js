import express from 'express'
import { param } from 'express-validator'

// 🧠 Controladores
import {
  getPromotion,
  getAllPromotions,
  updatePromotion,
  togglePromoActive,
  deletePromotion,
  validatePromotion
} from '../controllers/promoController.js'

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'
import validarErrores from '../middleware/validarErrores.js'

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

/* 🔐 Rutas solo para administrador */

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
  validatePromotion,
  validarErrores,
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
  param('id')
    .isMongoId()
    .withMessage('⚠️ ID de promoción inválido'),
  validarErrores,
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
  param('id')
    .isMongoId()
    .withMessage('⚠️ ID inválido para eliminar promoción'),
  validarErrores,
  deletePromotion
)

export default router
