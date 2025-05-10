// 📁 backend/routes/authRoutes.js
import express from 'express';

// 🎯 Controladores
import { loginAdmin } from '../controllers/authController.js';
import { refreshTokenController } from '../controllers/refreshTokenController.js';

// 🚀 Router de Express
const router = express.Router();

/* ───────────────────────────────────────────── */
/* 🔐 RUTAS DE AUTENTICACIÓN SOLO PARA ADMIN     */
/* ───────────────────────────────────────────── */

/**
 * 🎫 POST /api/auth/login
 * ➤ Iniciar sesión (solo admins)
 * ⚠️ Validaciones deshabilitadas temporalmente para depuración
 */
router.post(
  '/login',
  loginAdmin
);

/**
 * 🔄 POST /api/auth/refresh
 * ➤ Renovar accessToken usando refreshToken (cookie HTTP-only)
 */
router.post(
  '/refresh',
  refreshTokenController
);

export default router;
