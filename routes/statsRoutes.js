// 📁 routes/statsRoutes.js
import express from 'express'

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

// 📈 Controladores
import { getResumenEstadisticas } from '../controllers/statsController.js'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 📈 RUTAS DE ESTADÍSTICAS (SOLO ADMIN)                                      */
/* -------------------------------------------------------------------------- */

/**
 * 📊 Obtener resumen de estadísticas para el panel administrativo
 * GET /api/stats/resumen
 */
router.get('/resumen', authMiddleware, adminOnly, getResumenEstadisticas)

// 🚀 Exportar router
export default router
