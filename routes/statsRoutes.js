// 📁 routes/statsRoutes.js
import express from 'express'

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

// 📊 Controladores
import { getResumenEstadisticas } from '../controllers/statsController.js'

const router = express.Router()

/* ───────────────────────────────────────────── */
/* 📊 RUTAS DE ESTADÍSTICAS (SOLO ADMIN)        */
/* ───────────────────────────────────────────── */

/**
 * GET /api/stats/resumen
 * ➤ Obtener resumen de estadísticas para el panel administrativo
 */
router.get(
  '/resumen',
  authMiddleware,
  adminOnly,
  getResumenEstadisticas
)

export default router
