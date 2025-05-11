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
    const rawToken = req.cookies?.refreshToken;

    if (!rawToken || typeof rawToken !== 'string') {
      logger.warn('🛑 No se proporcionó refreshToken en cookies.');
      return res.status(401).json({
        ok: false,
        message: '❌ Debes iniciar sesión para continuar.'
      });
    }

    let payload;
    try {
      payload = jwt.verify(rawToken, config.jwtRefreshSecret);
    } catch (err) {
      logger.warn(`⛔ Token inválido o expirado: ${err.message}`);
      return res.status(403).json({
        ok: false,
        message: '⛔ Tu sesión ha expirado. Vuelve a iniciar sesión.',
        ...(config.env !== 'production' && { error: err.message })
      });
    }

    const userId = String(payload.id || '').trim();
    if (!userId || userId.length < 10) {
      logger.warn(`⚠️ ID inválido extraído del token: ${userId}`);
      return res.status(403).json({ ok: false, message: '⚠️ Token inválido. ID incorrecto.' });
    }

    const user = await User.findById(userId).select('+refreshToken');
    if (!user) {
      logger.warn(`❌ Usuario no encontrado con ID: ${userId}`);
      return res.status(403).json({ ok: false, message: '❌ Usuario no válido. Inicia sesión.' });
    }

    if (user.refreshToken !== rawToken) {
      logger.warn(`⚠️ Token no coincide para el usuario ${user.username || user.email}`);
      return res.status(403).json({ ok: false, message: '⚠️ Sesión inválida. Requiere nuevo login.' });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '15m' }
    );

    logger.info(`🔁 Nuevo AccessToken emitido para: ${user.username || user.email}`);

    return res.status(200).json({
      ok: true,
      accessToken: newAccessToken,
      message: '✅ Token renovado correctamente.'
    });
  } catch (err) {
    logger.error('❌ Error al renovar el token:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al renovar token. Intenta iniciar sesión nuevamente.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};
