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
    expiresIn: '15m'
  });

/**
 * 🔁 Genera JWT de refresco (7 días)
 */
const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, config.jwtRefreshSecret, {
    expiresIn: '7d'
  });

/**
 * 🎫 POST /api/auth/login
 * Login exclusivo para administradores
 */
export const loginAdmin = async (req, res) => {
  console.log('🧪 BODY RECIBIDO:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Errores de validación:', errors.array());
    return enviarError(res, '❌ Datos inválidos en el formulario.', 400);
  }

  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    console.log('🧪 Intento de login con usuario:', username);

    if (!username || !password) {
      console.log('⚠️ Usuario o contraseña vacíos');
      return enviarError(res, '⚠️ Usuario y contraseña requeridos.', 400);
    }

    const user = await User.findOne({ username }).select('+password +refreshToken');
    console.log('🧪 Usuario encontrado en DB:', user ? user.username : '❌ No encontrado');

    if (!user || user.role !== 'admin') {
      console.log('❌ Usuario no es admin o no existe');
      return enviarError(res, '❌ Credenciales inválidas o sin permisos.', 401);
    }

    const isMatch = await user.matchPassword(password);
    console.log('🔐 ¿Contraseña coincide?:', isMatch);

    if (!isMatch) {
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
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    return enviarExito(res, {
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    }, '✅ Acceso concedido');
  } catch (err) {
    console.error('❌ Error loginAdmin:', config.env !== 'production' ? err : err.message);
    return enviarError(res, '❌ Error interno al iniciar sesión.', 500);
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
      return enviarError(res, '❌ Token de refresco inválido o expirado.', 403);
    }

    const user = await User.findById(payload.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return enviarError(res, '❌ Token no válido o revocado.', 403);
    }

    const newAccessToken = generateAccessToken(user);
    return enviarExito(res, { accessToken: newAccessToken }, '✅ Token renovado');
  } catch (err) {
    console.error('❌ Error al renovar token:', config.env !== 'production' ? err : err.message);
    return enviarError(res, '❌ Error interno al renovar token.', 500);
  }
};
