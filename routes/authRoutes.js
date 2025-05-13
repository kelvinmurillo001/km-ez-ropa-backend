// 📁 backend/routes/authRoutes.js

import express from 'express';
import { loginAdmin, loginCliente, refreshToken, getUsuarioActual } from '../controllers/authController.js';
import logger from '../utils/logger.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { loginValidation, loginClienteValidation } from '../validators/authValidator.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 🔐 LOGIN ADMINISTRADOR                        */
/* ───────────────────────────────────────────── */
router.post(
  '/login',
  loginValidation,
  (req, res, next) => {
    logger.info(`🔐 POST ${req.originalUrl} - Login admin desde IP: ${req.ip}`);
    return loginAdmin(req, res, next);
  }
);

/* ───────────────────────────────────────────── */
/* 👤 LOGIN CLIENTE                              */
/* ───────────────────────────────────────────── */
router.post(
  '/login-cliente',
  loginClienteValidation,
  (req, res, next) => {
    logger.info(`👤 POST ${req.originalUrl} - Login cliente desde IP: ${req.ip}`);
    return loginCliente(req, res, next);
  }
);

/* ───────────────────────────────────────────── */
/* 🔁 REFRESCAR ACCESS TOKEN                     */
/* ───────────────────────────────────────────── */
router.post(
  '/refresh',
  (req, res, next) => {
    logger.debug(`🔄 POST ${req.originalUrl} - Refresh token desde IP: ${req.ip}`);
    return refreshToken(req, res, next);
  }
);

/* ───────────────────────────────────────────── */
/* 🔎 USUARIO ACTUAL AUTENTICADO (JWT o sesión)  */
/* ───────────────────────────────────────────── */
router.get(
  '/me',
  authMiddleware,
  getUsuarioActual
);

export default router;
