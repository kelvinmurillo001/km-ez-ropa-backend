// 📁 backend/controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/configuracionesito.js';
import { validationResult } from 'express-validator';
import { enviarError, enviarExito } from '../utils/admin-auth-utils.js';

/**
 * 🔐 Genera JWT de acceso (15 minutos)
 */
const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
    expiresIn: '15m',
  });

/**
 * 🔁 Genera JWT de refresco (7 días)
 */
const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, config.jwtRefreshSecret, {
    expiresIn: '7d',
  });

/**
 * 🎫 POST /api/auth/login
 * Login exclusivo para administradores
 */
export const loginAdmin = async (req, res) => {
  console.log('📥 [LOGIN] Body recibido:', req.body);

  // ⛔ Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('⚠️ Errores de validación:', errors.array());
    return enviarError(res, '❌ Datos inválidos en el formulario.', 400, errors.array());
  }

  try {
    const rawUser = String(req.body.username || '').trim().toLowerCase();
    const rawPass = String(req.body.password || '');

    if (!rawUser || !rawPass) {
      return enviarError(res, '⚠️ Usuario y contraseña requeridos.', 400);
    }

    console.log(`🔍 Intento de login con: "${rawUser}"`);

    const user = await User.findOne({ username: rawUser }).select('+password +refreshToken');

    if (!user) {
      console.warn('❌ Usuario no encontrado');
      return enviarError(res, '❌ Usuario no encontrado.', 401);
    }

    if (user.role !== 'admin') {
      console.warn('⛔ Acceso denegado: no es admin');
      return enviarError(res, '⛔ Acceso restringido solo a administradores.', 403);
    }

    const isMatch = await user.matchPassword(rawPass);
    if (!isMatch) {
      console.warn('🔐 Contraseña incorrecta');
      return enviarError(res, '❌ Contraseña incorrecta.', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return enviarExito(
      res,
      {
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
      },
      '✅ Acceso concedido'
    );
  } catch (err) {
    console.error('💥 Error inesperado en loginAdmin:', err);
    return enviarError(res, '❌ Error interno al iniciar sesión.', 500, err.message);
  }
};

/**
 * ✨ POST /api/auth/refresh
 * Renovar access token usando refresh token (cookie)
 */
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return enviarError(res, '❌ Refresh token no proporcionado.', 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtRefreshSecret);
    } catch (err) {
      console.warn('⛔ Refresh token inválido o expirado');
      return enviarError(res, '❌ Token inválido o expirado.', 403);
    }

    const user = await User.findById(payload.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return enviarError(res, '⛔ Token de refresco no coincide.', 403);
    }

    const newAccessToken = generateAccessToken(user);
    return enviarExito(res, { accessToken: newAccessToken }, '🔄 Token renovado');
  } catch (err) {
    console.error('💥 Error al renovar token:', err);
    return enviarError(res, '❌ Error al procesar token de sesión.', 500, err.message);
  }
};
