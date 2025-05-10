// 📁 backend/controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/configuracionesito.js';
import { validationResult } from 'express-validator';

/**
 * 🔐 Genera JWT de acceso (15 minutos)
 */
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: '15m' }
  );

/**
 * 🔁 Genera JWT de refresco (7 días)
 */
const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    config.jwtRefreshSecret,
    { expiresIn: '7d' }
  );

/**
 * 🎫 POST /api/auth/login
 * Login exclusivo para administradores
 */
export const loginAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map(e => ({ message: e.msg, field: e.param }))
    });
  }

  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const user = await User.findOne({ username }).select('+password +refreshToken');

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ ok: false, message: '❌ Credenciales inválidas o sin permisos.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, message: '❌ Contraseña incorrecta.' });
    }

    // 🔐 Generar tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 🧠 Guardar refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // 🍪 Establecer cookie segura
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      ok: true,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('❌ Error loginAdmin:', config.env !== 'production' ? err : err.message);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al iniciar sesión.',
      ...(config.env !== 'production' && { error: err.message })
    });
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
      return res.status(401).json({ ok: false, message: '❌ Refresh token no proporcionado.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtRefreshSecret);
    } catch (err) {
      return res.status(403).json({ ok: false, message: '❌ Token de refresco inválido o expirado.' });
    }

    const user = await User.findById(payload.id).select('+refreshToken');
    if (!user || !user.refreshToken || user.refreshToken !== token) {
      return res.status(403).json({ ok: false, message: '❌ Token no válido o revocado.' });
    }

    // 🆕 Generar nuevo accessToken
    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      ok: true,
      accessToken: newAccessToken
    });
  } catch (err) {
    console.error('❌ Error al renovar token:', config.env !== 'production' ? err : err.message);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al renovar token.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};
