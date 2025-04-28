// 📁 backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * 🔐 Middleware para proteger rutas usando JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    // 🔎 Verificar encabezado Authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        message: '🔐 Token no proporcionado o con formato incorrecto'
      })
    }

    const token = authHeader.split(' ')[1]?.trim()

    // 🚫 Token inválido o sospechosamente corto
    if (!token || token.length < 10) {
      console.warn('⛔ Token muy corto o inválido recibido.')
      return res.status(401).json({
        ok: false,
        message: '🔒 Token inválido o muy corto'
      })
    }

    // ✅ Verificar y decodificar JWT
    let decoded = null
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.warn('⛔ JWT inválido:', err.message)
      return res.status(401).json({
        ok: false,
        message: '⛔ Token expirado o inválido'
      })
    }

    // 👤 Buscar usuario en la base de datos
    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: '⛔ Usuario no encontrado o eliminado'
      })
    }

    // 💾 Adjuntar usuario verificado al request
    req.user = user
    next()
  } catch (error) {
    console.error('❌ Error en authMiddleware:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno en autenticación',
      error: error.message
    })
  }
}

export default authMiddleware
