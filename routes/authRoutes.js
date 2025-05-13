// 📁 backend/routes/authRoutes.js
import express from 'express';
import { body } from 'express-validator';

// 🎯 Controladores
import {
  loginAdmin,
  loginCliente,
  refreshToken,
  getUsuarioActual
} from '../controllers/authController.js';

import logger from '../utils/logger.js';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  loginValidation,
  loginClienteValidation
} from '../validators/authValidator.js';

const router = express.Router();

/* ───────────────────────────────────────────── */
/* 🔐 LOGIN ADMIN (solo admins)                  */
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
/* 👤 LOGIN CLIENTE (correo + contraseña)         */
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
/* 🔁 RENOVAR ACCESS TOKEN (refresh token cookie) */
/* ───────────────────────────────────────────── */
router.post(
  '/refresh',
  (req, res, next) => {
    logger.debug(`🔄 POST ${req.originalUrl} - Refresh token desde IP: ${req.ip}`);
    return refreshToken(req, res, next);
  }
);

/* ───────────────────────────────────────────── */
/* 🔎 OBTENER USUARIO ACTUAL AUTENTICADO          */
/* ───────────────────────────────────────────── */
router.get(
  '/me',
  authMiddleware,
  getUsuarioActual
);

export default router;
