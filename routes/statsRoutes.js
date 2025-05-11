// 📁 backend/routes/statsRoutes.js
import express from 'express';

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';

// 📊 Controladores
import { getResumenEstadisticas } from '../controllers/statsController.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 📊 RUTAS DE ESTADÍSTICAS (SOLO ADMIN)        */
/* ───────────────────────────────────────────── */

/**
 * @route   GET /api/stats/resumen
 * @desc    Obtener resumen de estadísticas para el panel administrativo
 * @access  Privado (Solo Admin)
 */
router.get(
  '/resumen',
  authMiddleware,
  adminOnly,
  getResumenEstadisticas
);

export default router;
