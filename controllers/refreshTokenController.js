// 📁 backend/controllers/refreshTokenController.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import config from '../config/configuracionesito.js'
import logger from '../utils/logger.js'

/**
 * 🔄 Renovar Access Token usando Refresh Token desde cookie
 * @route   POST /api/auth/refresh-token
 * @access  Público
 */
export const refreshTokenController = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken

    // 🔐 Validar existencia del token
    if (!token) {
      logger.warn('🛑 Refresh token no proporcionado.')
      return res.status(401).json({
        ok: false,
        message: '❌ Debes iniciar sesión para continuar.'
      })
    }

    let payload
    try {
      // 🔍 Verificar integridad del token
      payload = jwt.verify(token, config.jwtRefreshSecret)
    } catch (err) {
      logger.warn(`⛔ Refresh token inválido o expirado: ${err.message}`)
      return res.status(403).json({
        ok: false,
        message: '⛔ Token expirado o inválido. Inicia sesión nuevamente.',
        ...(config.env !== 'production' && { error: err.message })
      })
    }

    // 🔎 Validar existencia de usuario y token coincidente
    const user = await User.findById(payload.id).select('+refreshToken')
    if (!user || user.refreshToken !== token) {
      logger.warn(`⚠️ Token revocado o usuario no válido. ID: ${payload.id}`)
      return res.status(403).json({
        ok: false,
        message: '⚠️ Token inválido o sesión no autorizada.'
      })
    }

    // ✅ Generar nuevo Access Token seguro
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '15m' }
    )

    logger.info(`🔁 Nuevo access token generado para usuario ${user.email || user._id}`)

    return res.status(200).json({
      ok: true,
      message: '✅ Access token renovado correctamente.',
      data: { accessToken }
    })
  } catch (err) {
    logger.error('❌ Error interno en refreshTokenController:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ No se pudo renovar el token. Intenta iniciar sesión nuevamente.',
      ...(config.env !== 'production' && { error: err.message })
    })
  }
}
