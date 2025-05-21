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
/* Endpoint: POST /api/auth/login                */
/* ───────────────────────────────────────────── */
router.post(
  '/login',
  loginValidation,
  (req, res, next) => {
    logger.info(`🔐 Login admin desde IP: ${req.ip}`);
    loginAdmin(req, res, next);
  }
);

/* ───────────────────────────────────────────── */
/* 👤 LOGIN CLIENTE                              */
/* Endpoint: POST /api/auth/login-cliente        */
/* ───────────────────────────────────────────── */
router.post(
  '/login-cliente',
  loginClienteValidation,
  (req, res, next) => {
    logger.info(`👤 Login cliente desde IP: ${req.ip}`);
    loginCliente(req, res, next);
  }
);

/* ───────────────────────────────────────────── */
/* 🔁 REFRESH TOKEN JWT                          */
/* Endpoint: POST /api/auth/refresh              */
/* ───────────────────────────────────────────── */
router.post(
  '/refresh',
  (req, res, next) => {
    logger.debug(`🔄 Refresh token desde IP: ${req.ip}`);
    refreshToken(req, res, next);
  }
);

/* ───────────────────────────────────────────── */
/* 🔎 OBTENER DATOS DEL USUARIO AUTENTICADO      */
/* Endpoint: GET /api/auth/me                    */
/* ───────────────────────────────────────────── */
router.get(
  '/me',
  authMiddleware,
  getUsuarioActual
);

export default router;
