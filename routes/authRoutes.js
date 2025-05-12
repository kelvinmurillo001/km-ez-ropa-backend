// 📁 backend/routes/authRoutes.js
import express from 'express';
import { body } from 'express-validator';

// 🎯 Controladores
import { loginAdmin } from '../controllers/authController.js';
import { refreshTokenController } from '../controllers/refreshTokenController.js';
import logger from '../utils/logger.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 🔐 RUTAS DE AUTENTICACIÓN SOLO PARA ADMIN     */
/* ───────────────────────────────────────────── */

/**
 * 🎫 POST /api/auth/login
 * ➤ Iniciar sesión (solo admins)
 */
router.post(
  '/login',
  [
    body('username')
      .trim()
      .toLowerCase()
      .exists().withMessage('⚠️ Usuario requerido')
      .isString().withMessage('⚠️ El usuario debe ser texto')
      .isLength({ min: 3 }).withMessage('⚠️ Usuario muy corto'),

    body('password')
      .trim()
      .exists().withMessage('⚠️ Contraseña requerida')
      .isString().withMessage('⚠️ La contraseña debe ser texto')
      .isLength({ min: 6 }).withMessage('⚠️ Contraseña muy corta')
  ],
  (req, res, next) => {
    logger.info(`🔐 POST ${req.originalUrl} - Login recibido desde IP: ${req.ip}`);
    return loginAdmin(req, res, next);
  }
);

/**
 * 🔄 POST /api/auth/refresh
 * ➤ Renovar accessToken usando refreshToken (cookie HTTP-only)
 */
router.post(
  '/refresh',
  (req, res, next) => {
    logger.debug(`🔄 POST ${req.originalUrl} - Refresh token desde IP: ${req.ip}`);
    return refreshTokenController(req, res, next);
  }
);

export default router;
