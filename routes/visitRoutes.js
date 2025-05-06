// 📁 routes/visitRoutes.js
import express from 'express'

// 📚 Controladores
import { registrarVisita, obtenerVisitas } from '../controllers/visitController.js'

// 🛡️ Middlewares
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
    const userAgent = String(req.headers['user-agent'] || '').toLowerCase()

    const bloqueados = ['curl', 'postman', 'bot', 'crawler', 'axios', 'python-requests']
    if (bloqueados.some(b => userAgent.includes(b))) {
      return res.status(403).json({
        ok: false,
        message: '🚫 Acceso automatizado denegado. Agente no permitido.'
      })
    }

    next()
  },
  registrarVisita
)

/**
 * 📊 Obtener total de visitas acumuladas (SOLO ADMIN)
 * GET /api/visitas
 */
router.get(
  '/',
  authMiddleware,
  adminOnly,
  obtenerVisitas
)

// 🚀 Exportar router
export default router
