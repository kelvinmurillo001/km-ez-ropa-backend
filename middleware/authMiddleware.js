// 📁 backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import config from '../config/configuracionesito.js'
import logger from '../utils/logger.js'

/**
 * 🔐 Middleware: Verifica autenticación de usuarios mediante JWT
 * @description Protege rutas privadas validando el token JWT en el header
 * @access     Requiere que el usuario haya iniciado sesión
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = String(req.headers.authorization || '')

    // 🔍 Validar formato Bearer
    if (!authHeader.startsWith('Bearer ')) {
      logger.warn(`🔐 Token mal formado en header: ${authHeader}`)
      return res.status(401).json({
        ok: false,
        message: '🔐 Acceso denegado. Formato de token incorrecto.'
      })
    }

    const token = authHeader.split(' ')[1]

    // ⚠️ Validación básica de longitud
    if (!token || token.length < 20) {
      logger.warn('⛔ Token ausente o sospechosamente corto')
      return res.status(401).json({
        ok: false,
        message: '⛔ Token inválido o no proporcionado.'
      })
    }

    // ✅ Verificación de JWT
    let decoded
    try {
      decoded = jwt.verify(token, config.jwtSecret)
    } catch (err) {
      logger.warn(`⛔ JWT inválido o expirado: ${err.message}`)
      return res.status(401).json({
        ok: false,
        message: '⛔ Token expirado o inválido. Por favor inicia sesión nuevamente.'
      })
    }

    // 👤 Verificar usuario en base de datos
    const user = await User.findById(decoded.id)
      .select('-password -refreshToken')
      .lean()

    if (!user) {
      logger.warn(`🚫 Usuario no encontrado en DB: ${decoded.id}`)
      return res.status(401).json({
        ok: false,
        message: '🚫 Usuario no autorizado o inexistente.'
      })
    }

    // 🧩 Añadir usuario al request
    req.user = user
    return next()
  } catch (err) {
    logger.error('❌ Error inesperado en authMiddleware:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al verificar autenticación.',
      ...(config.env !== 'production' && { error: err.message })
    })
  }
}

export default authMiddleware
