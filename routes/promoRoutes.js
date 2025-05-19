// 📁 backend/routes/promoRoutes.js

import express from 'express';
import { param } from 'express-validator';

// 🎯 Controladores
import {
  getPromotion,
  getAllPromotions,
  updatePromotion,
  togglePromoActive,
  deletePromotion,
  validatePromotion
} from '../controllers/promoController.js';

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';
import validarErrores from '../middleware/validarErrores.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 📢 RUTAS PÚBLICAS                             */
/* ───────────────────────────────────────────── */

/**
 * @route   GET /api/promos
 * @desc    Obtener promociones activas y vigentes
 * @access  Público
 */
router.get('/', getPromotion);

/* ───────────────────────────────────────────── */
/* 🔐 RUTAS PROTEGIDAS (ADMIN)                   */
/* ───────────────────────────────────────────── */

router.use(authMiddleware, adminOnly);

/**
 * @route   GET /api/promos/admin
 * @desc    Obtener todas las promociones
 * @access  Admin
 */
router.get('/admin', getAllPromotions);

/**
 * @route   PUT /api/promos
 * @desc    Crear o actualizar una promoción
 * @access  Admin
 */
router.put(
  '/',
  validatePromotion,
  validarErrores,
  updatePromotion
);

/**
 * @route   PATCH /api/promos/:id/estado
 * @desc    Alternar estado activo/inactivo de promoción
 * @access  Admin
 */
router.patch(
  '/:id/estado',
  param('id').isMongoId().withMessage('⚠️ ID de promoción inválido'),
  validarErrores,
  togglePromoActive
);

/**
 * @route   DELETE /api/promos/:id
 * @desc    Eliminar una promoción
 * @access  Admin
 */
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('⚠️ ID inválido para eliminar promoción'),
  validarErrores,
  deletePromotion
);

export default router;
