// 📁 backend/routes/visitRoutes.js
import express from 'express';

// 📚 Controladores
import { registrarVisita, obtenerVisitas } from '../controllers/visitController.js';

// 🛡️ Seguridad
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 📈 RUTAS: GESTIÓN DE VISITAS WEB              */
/* ───────────────────────────────────────────── */

/**
 * @route   POST /api/visitas/registrar
 * @desc    Registrar una nueva visita (solo desde navegadores reales)
 * @access  Público
 */
router.post(
  '/registrar',
  (req, res, next) => {
    const userAgent = String(req.headers['user-agent'] || '').toLowerCase();

    // Bloquear bots, scripts y scrapers
    const agentesBloqueados = ['curl', 'postman', 'bot', 'crawler', 'axios', 'python', 'fetch'];

    const esBot = agentesBloqueados.some(fragmento =>
      userAgent.includes(fragmento)
    );

    if (esBot) {
      return res.status(403).json({
        ok: false,
        message: '🚫 Acceso automatizado denegado.'
      });
    }

    next();
  },
  registrarVisita
);

/**
 * @route   GET /api/visitas
 * @desc    Obtener el total de visitas (panel admin)
 * @access  Privado (solo admin)
 */
router.get(
  '/',
  authMiddleware,
  adminOnly,
  obtenerVisitas
);

export default router;
