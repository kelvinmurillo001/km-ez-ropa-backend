// 📁 backend/middleware/adminOnly.js
import logger from '../utils/logger.js'
import config from '../config/configuracionesito.js'

/**
 * 🔒 Middleware: restringe acceso solo a usuarios con rol "admin"
 * @description Verifica que el usuario autenticado tenga rol de administrador
 * @access Solo para rutas protegidas tipo administrativo
 */
const adminOnly = (req, res, next) => {
  try {
    const user = req.user

    // 🚫 Usuario no autenticado
    if (!user) {
      logger.warn('❌ Acceso no autorizado: usuario no autenticado.')
      return res.status(401).json({
        ok: false,
        message: '🚫 Acceso denegado. Inicia sesión como administrador.'
      })
    }

    const role = String(user.role || '').trim().toLowerCase()

    // ⛔ Usuario autenticado pero sin permisos
    if (role !== 'admin') {
      logger.warn(`⛔ Usuario sin permisos: ${user._id} (rol: ${role})`)
      return res.status(403).json({
        ok: false,
        message: '⛔ Acción denegada. Requiere permisos de administrador.'
      })
    }

    // ✅ Acceso permitido
    return next()
  } catch (err) {
    logger.error('❌ Error en middleware adminOnly:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al validar rol de administrador.',
      ...(config.env !== 'production' && { error: err.message })
    })
  }
}

export default adminOnly
