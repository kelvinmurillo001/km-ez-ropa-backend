// 📁 backend/controllers/refreshTokenController.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import config from '../config/configuracionesito.js'
import logger from '../utils/logger.js'

/**
 * 🔄 POST /api/auth/refresh-token
 * ➤ Renovar Access Token usando Refresh Token (desde cookie HTTP-only)
 */
export const refreshTokenController = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken

    if (!token) {
      logger.warn('🛑 Refresh token no proporcionado en la cookie.')
      return res.status(401).json({
        ok: false,
        message: '❌ Debes iniciar sesión para continuar.'
      })
    }

    let payload
    try {
      payload = jwt.verify(token, config.jwtRefreshSecret)
    } catch (err) {
      logger.warn(`⛔ Token de refresco inválido o expirado: ${err.message}`)
      return res.status(403).json({
        ok: false,
        message: '⛔ Tu sesión ha expirado. Inicia sesión nuevamente.',
        ...(config.env !== 'production' && { error: err.message })
      })
    }

    const user = await User.findById(payload.id).select('+refreshToken')

    if (!user || user.refreshToken !== token) {
      logger.warn(`⚠️ Refresh token no coincide o fue revocado. ID: ${payload.id}`)
      return res.status(403).json({
        ok: false,
        message: '⚠️ Sesión inválida. Por favor inicia sesión de nuevo.'
      })
    }

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '15m' }
    )

    logger.info(`🔁 Nuevo access token emitido para usuario: ${user.email || user._id}`)

    return res.status(200).json({
      ok: true,
      accessToken: newAccessToken,
      message: '✅ Nuevo access token generado correctamente.'
    })
  } catch (err) {
    logger.error('❌ Error interno al renovar token:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ No se pudo renovar el token. Inicia sesión nuevamente.',
      ...(config.env !== 'production' && { error: err.message })
    })
  }
}
