// 📁 backend/controllers/refreshTokenController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

/**
 * 🔄 POST /api/auth/refresh
 * ➤ Renovar Access Token usando Refresh Token (desde cookie HTTP-only)
 */
export const refreshTokenController = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      logger.warn('🛑 Refresh token no proporcionado en la cookie.');
      return res.status(401).json({
        ok: false,
        message: '❌ Debes iniciar sesión para continuar.'
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtRefreshSecret);
    } catch (err) {
      logger.warn(`⛔ Refresh token inválido o expirado: ${err.message}`);
      return res.status(403).json({
        ok: false,
        message: '⛔ Tu sesión ha expirado. Inicia sesión nuevamente.',
        ...(config.env !== 'production' && { error: err.message })
      });
    }

    const userId = String(payload.id || '').trim();
    if (!userId) {
      logger.warn('⚠️ ID de usuario inválido en el token.');
      return res.status(403).json({ ok: false, message: '⚠️ Token inválido.' });
    }

    const user = await User.findById(userId).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      logger.warn(`⚠️ Token revocado o no coincide. ID: ${userId}`);
      return res.status(403).json({
        ok: false,
        message: '⚠️ Sesión inválida. Por favor inicia sesión de nuevo.'
      });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    logger.info(`🔁 Nuevo access token emitido para: ${user.email || user.username || user._id}`);

    return res.status(200).json({
      ok: true,
      accessToken: newAccessToken,
      message: '✅ Access token renovado exitosamente.'
    });
  } catch (err) {
    logger.error('❌ Error interno al renovar token:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ No se pudo renovar el token. Inicia sesión nuevamente.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};
