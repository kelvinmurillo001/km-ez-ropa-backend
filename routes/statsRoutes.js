// 📁 backend/routes/statsRoutes.js

import express from 'express';

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';

// 📊 Controlador
import { getResumenEstadisticas } from '../controllers/statsController.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 📊 RUTAS DE ESTADÍSTICAS (SOLO ADMIN)        */
/* ───────────────────────────────────────────── */

/**
 * @route   GET /api/stats/resumen
 * @desc    Obtener resumen de estadísticas para panel admin
 * @access  Privado (adminOnly)
 */
router.get(
  '/resumen',
  authMiddleware,
  adminOnly,
  getResumenEstadisticas
);

export default router;
