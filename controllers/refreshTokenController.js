// 📁 backend/controllers/refreshTokenController.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js'; // Asegúrate de tener logger.js creado

/* -------------------------------------------------------------------------- */
/* 🔄 Renovar el Access Token usando un Refresh Token                         */
/* -------------------------------------------------------------------------- */

export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.warn('🛑 Refresh token no proporcionado en solicitud.');
    return res.status(400).json({ ok: false, message: '❌ Token de refresco requerido.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user) {
      logger.warn('🛑 Usuario no encontrado al usar refresh token.');
      return res.status(403).json({ ok: false, message: '❌ Token inválido o ha sido revocado.' });
    }

    if (user.refreshToken !== refreshToken) {
      logger.warn(`⚠️ Refresh token no coincide con el almacenado para el usuario: ${user.username}`);
      return res.status(403).json({ ok: false, message: '❌ Token inválido o ha sido revocado.' });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    logger.info(`🔁 Access token renovado exitosamente para: ${user.username}.`);

    return res.status(200).json({
      ok: true,
      accessToken: newAccessToken,
      message: '✅ Nuevo token generado correctamente.'
    });
  } catch (error) {
    logger.error('❌ Error al renovar access token con refresh token:', error.message);
    return res.status(403).json({
      ok: false,
      message: '❌ Token inválido o expirado.',
      error: error.message
    });
  }
};
