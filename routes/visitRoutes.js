// 📁 routes/visitRoutes.js
import express from 'express'
import { registrarVisita, obtenerVisitas } from '../controllers/visitController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminOnly.js'

const router = express.Router()

/* -------------------------------------------------------------------------- */
/* 📈 RUTAS DE VISITAS                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 📌 Registrar una nueva visita (PÚBLICO)
 * POST /api/visitas/registrar
 */
router.post(
  '/registrar',
  (req, res, next) => {
    const userAgent = req.headers['user-agent'] || ''
    if (/curl|postman|bot|crawler/i.test(userAgent)) {
      return res.status(403).json({ message: '🚫 Acceso automatizado denegado' })
    }
    next()
  },
  registrarVisita
)

/**
 * 📊 Obtener total de visitas acumuladas (SOLO ADMIN)
 * GET /api/visitas
 */
router.get('/', authMiddleware, adminOnly, obtenerVisitas)

export default router
