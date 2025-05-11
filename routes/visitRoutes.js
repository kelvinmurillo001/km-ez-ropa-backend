// 📁 routes/visitRoutes.js
import express from 'express';

// 📚 Controladores
import { registrarVisita, obtenerVisitas } from '../controllers/visitController.js';

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 📈 RUTAS DE VISITAS                           */
/* ───────────────────────────────────────────── */

/**
 * @route   POST /api/visitas/registrar
 * @desc    Registrar una nueva visita (público, excepto bots)
 * @access  Público (user-agent filtrado)
 */
router.post(
  '/registrar',
  (req, res, next) => {
    const userAgent = String(req.headers['user-agent'] || '').toLowerCase();

    const bloqueados = ['curl', 'postman', 'bot', 'crawler', 'axios', 'python-requests'];
    if (bloqueados.some(b => userAgent.includes(b))) {
      return res.status(403).json({
        ok: false,
        message: '🚫 Acceso automatizado denegado. Agente no permitido.'
      });
    }

    next();
  },
  registrarVisita
);

/**
 * @route   GET /api/visitas
 * @desc    Obtener el total de visitas (solo admins)
 * @access  Privado (Admin)
 */
router.get(
  '/',
  authMiddleware,
  adminOnly,
  obtenerVisitas
);

// 🚀 Exportar router
export default router;
