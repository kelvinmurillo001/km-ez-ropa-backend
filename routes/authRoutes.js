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

// 🧩 Middlewares específicos
const registrarIntentoLoginAdmin = (req, res, next) => {
  logger.info(`🔐 Login admin desde IP: ${req.ip}`);
  loginAdmin(req, res, next);
};

const registrarIntentoLoginCliente = (req, res, next) => {
  logger.info(`👤 Login cliente desde IP: ${req.ip}`);
  loginCliente(req, res, next);
};

const logRefresh = (req, res, next) => {
  logger.debug(`🔄 Refresh token desde IP: ${req.ip}`);
  refreshToken(req, res, next);
};

/* ────────────── 🔐 ADMIN LOGIN ─────────────── */
router.post('/login', loginValidation, registrarIntentoLoginAdmin);

/* ─────────────── 👤 CLIENTE LOGIN ───────────── */
router.post('/login-cliente', loginClienteValidation, registrarIntentoLoginCliente);

/* ───────────── 🔁 JWT REFRESH TOKEN ─────────── */
router.post('/refresh', logRefresh);

/* ─────── 🔎 USUARIO ACTUAL (AUTENTICADO) ────── */
router.get('/me', authMiddleware, getUsuarioActual);

export default router;
