// 📁 routes/statsRoutes.js
import express from 'express'

import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

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

export default router
