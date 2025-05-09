// 📁 backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import config from '../config/configuracionesito.js'
import logger from '../utils/logger.js'

/**
 * 🔐 Middleware híbrido: permite acceso con JWT o sesión activa (Google)
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = String(req.headers.authorization || '')

    // ✅ Si tiene JWT Bearer
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      if (!token || token.length < 20) {
        logger.warn('⛔ Token sospechosamente corto')
        return res.status(401).json({ ok: false, message: '⛔ Token inválido o no proporcionado.' })
      }

      let decoded
      try {
        decoded = jwt.verify(token, config.jwtSecret)
      } catch (err) {
        logger.warn(`⛔ JWT inválido o expirado: ${err.message}`)
        return res.status(401).json({ ok: false, message: '⛔ Token expirado o inválido.' })
      }

      const user = await User.findById(decoded.id).select('-password -refreshToken').lean()
      if (!user) {
        logger.warn(`🚫 Usuario no encontrado con JWT: ${decoded.id}`)
        return res.status(401).json({ ok: false, message: '🚫 Usuario no autorizado.' })
      }

      req.user = user
      return next()
    }

    // ✅ Si tiene sesión activa con Passport (Google)
    if (req.isAuthenticated?.() && req.user) {
      req.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
      return next()
    }

    // ❌ No autenticado
    logger.warn('🔐 Acceso no autenticado (ni token ni sesión)')
    return res.status(401).json({
      ok: false,
      message: '🔒 Debes iniciar sesión para acceder.'
    })
  } catch (err) {
    logger.error('❌ Error en authMiddleware:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error al verificar autenticación.',
      ...(config.env !== 'production' && { error: err.message })
    })
  }
}

export default authMiddleware
