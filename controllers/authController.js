// 📁 backend/controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/configuracionesito.js';
import { validationResult } from 'express-validator';
import { enviarError, enviarExito } from '../utils/admin-auth-utils.js';

/* ───────────────────────────────────────────── */
/* 🔐 GENERADORES DE TOKEN JWT                   */
/* ───────────────────────────────────────────── */
const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: '15m' });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, config.jwtRefreshSecret, { expiresIn: '7d' });

/* ───────────────────────────────────────────── */
/* 🛡️ LOGIN DE ADMINISTRADOR                    */
/* ───────────────────────────────────────────── */
export const loginAdmin = async (req, res) => {
  console.log('📥 [LOGIN ADMIN] Body:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return enviarError(res, '❌ Datos inválidos en el formulario.', 400, errors.array());
  }

  try {
    const rawUser = String(req.body.username || '').trim().toLowerCase();
    const rawPass = String(req.body.password || '');

    const user = await User.findOne({
      $or: [{ username: rawUser }, { email: rawUser }]
    }).select('+password +refreshToken');

    if (!user || user.role !== 'admin') {
      return enviarError(res, '⛔ Acceso restringido solo a administradores.', 403);
    }

    const isMatch = await user.matchPassword(rawPass);
    if (!isMatch) {
      return enviarError(res, '❌ Usuario o contraseña incorrectos.', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'None',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return enviarExito(res, {
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    }, '✅ Acceso administrador concedido');
  } catch (err) {
    console.error('💥 Error en loginAdmin:', err);
    return enviarError(res, '❌ Error interno', 500, err.message);
  }
};

/* ───────────────────────────────────────────── */
/* 👤 LOGIN CLIENTE                             */
/* ───────────────────────────────────────────── */
export const loginCliente = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return enviarError(res, '⚠️ Validación fallida.', 400, errors.array());
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password +refreshToken');
    if (!user || user.role !== 'client') {
      return enviarError(res, '❌ Credenciales inválidas o usuario no permitido.', 401);
    }

    const valid = await user.matchPassword(password);
    if (!valid) {
      return enviarError(res, '❌ Contraseña incorrecta.', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'None',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return enviarExito(res, {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, '✅ Login cliente exitoso');
  } catch (err) {
    console.error('💥 Error en loginCliente:', err);
    return enviarError(res, '❌ Error al iniciar sesión cliente', 500, err.message);
  }
};

/* ───────────────────────────────────────────── */
/* 🔁 REFRESH TOKEN                             */
/* ───────────────────────────────────────────── */
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return enviarError(res, '❌ Refresh token no proporcionado.', 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtRefreshSecret);
    } catch {
      return enviarError(res, '❌ Token inválido o expirado.', 403);
    }

    const user = await User.findById(payload.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return enviarError(res, '⛔ Token de refresco no coincide.', 403);
    }

    const newAccessToken = generateAccessToken(user);
    return enviarExito(res, { accessToken: newAccessToken }, '↺ Token renovado');
  } catch (err) {
    console.error('💥 Error al renovar token:', err);
    return enviarError(res, '❌ Error al procesar token de sesión.', 500, err.message);
  }
};

/* ───────────────────────────────────────────── */
/* 👁️ OBTENER USUARIO ACTUAL                   */
/* ───────────────────────────────────────────── */
export const getUsuarioActual = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    if (!user) {
      return enviarError(res, '❌ Usuario no encontrado.', 404);
    }

    return enviarExito(res, { user }, '✅ Usuario autenticado');
  } catch (err) {
    console.error('💥 Error en /auth/me:', err);
    return enviarError(res, '❌ Error al obtener usuario', 500, err.message);
  }
};
