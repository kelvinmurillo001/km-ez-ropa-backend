// 📁 backend/routes/authRoutes.js

import express from 'express';
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
/* 🔐 LOGIN ADMINISTRADOR                        */
/* POST /api/auth/login                          */
/* ───────────────────────────────────────────── */
router.post(
  '/login',
  loginValidation,
  (req, res, next) => {
    logger.info(`🔐 POST ${req.originalUrl} - Intento de login admin desde IP: ${req.ip}`);
    return loginAdmin(req, res, next);
  }
);

/* ───────────────────────────────────────────── */
/* 👤 LOGIN CLIENTE                              */
/* POST /api/auth/login-cliente                  */
/* ───────────────────────────────────────────── */
router.post(
  '/login-cliente',
  loginClienteValidation,
  (req, res, next) => {
    logger.info(`👤 POST ${req.originalUrl} - Intento de login cliente desde IP: ${req.ip}`);
    return loginCliente(req, res, next);
  }
);

/* ───────────────────────────────────────────── */
/* 🔁 REFRESH TOKEN JWT                          */
/* POST /api/auth/refresh                        */
/* ───────────────────────────────────────────── */
router.post(
  '/refresh',
  (req, res, next) => {
    logger.debug(`🔄 POST ${req.originalUrl} - Solicitud refresh token desde IP: ${req.ip}`);
    return refreshToken(req, res, next);
  }
);

/* ───────────────────────────────────────────── */
/* 🔎 DATOS DEL USUARIO AUTENTICADO              */
/* GET /api/auth/me                              */
/* ───────────────────────────────────────────── */
router.get(
  '/me',
  authMiddleware,
  getUsuarioActual
);

export default router;
