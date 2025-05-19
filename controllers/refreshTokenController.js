// 📁 backend/controllers/refreshTokenController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

/**
 * 🔄 POST /api/auth/refresh
 * ➤ Renueva el Access Token a partir del Refresh Token (vía cookie HTTP-only)
 */
export const refreshTokenController = async (req, res) => {
  try {
    const rawToken = req.cookies?.refreshToken;

    // 🔐 Validar token presente
    if (!rawToken || typeof rawToken !== 'string' || rawToken.length < 20) {
      logger.warn('🛑 Refresh token ausente o inválido.');
      return res.status(401).json({
        ok: false,
        message: '❌ Debes iniciar sesión para continuar.'
      });
    }

    // 🔍 Verificar firma del token
    let payload;
    try {
      payload = jwt.verify(rawToken, config.jwtRefreshSecret);
    } catch (err) {
      logger.warn(`⛔ Token de refresco inválido o expirado: ${err.message}`);
      return res.status(403).json({
        ok: false,
        message: '⛔ Tu sesión ha expirado. Inicia sesión nuevamente.',
        ...(config.env !== 'production' && { error: err.message })
      });
    }

    // 📌 Extraer y validar ID del token
    const userId = String(payload.id || '').trim();
    if (!userId || userId.length < 10) {
      logger.warn(`⚠️ ID inválido extraído del token: ${userId}`);
      return res.status(403).json({ ok: false, message: '⚠️ Token inválido. ID incorrecto.' });
    }

    // 🔎 Verificar usuario y token registrado
    const user = await User.findById(userId).select('+refreshToken');
    if (!user) {
      logger.warn(`❌ Usuario no encontrado con ID: ${userId}`);
      return res.status(403).json({ ok: false, message: '❌ Usuario no válido. Inicia sesión.' });
    }

    if (user.refreshToken !== rawToken) {
      logger.warn(`⚠️ El refreshToken no coincide para ${user.username || user.email || 'N/A'}`);
      return res.status(403).json({ ok: false, message: '⚠️ Sesión inválida. Requiere nuevo login.' });
    }

    // ✅ Generar nuevo Access Token
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    logger.info(`🔁 AccessToken renovado para: ${user.username || user.email || 'N/A'}`);

    return res.status(200).json({
      ok: true,
      accessToken: newAccessToken,
      message: '✅ Token renovado correctamente.'
    });
  } catch (err) {
    logger.error('❌ Error inesperado al renovar token:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al renovar token. Intenta iniciar sesión nuevamente.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};
