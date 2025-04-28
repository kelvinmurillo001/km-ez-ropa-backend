// 📁 backend/middleware/adminOnly.js

/**
 * 🔒 Middleware para restringir el acceso solo a administradores
 */
const adminOnly = (req, res, next) => {
  try {
    const user = req.user

    // 🔐 Verificar si el usuario está autenticado
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: '🚫 No autenticado. Se requiere login de administrador.'
      })
    }

    // ✅ Verificar si el usuario tiene rol de administrador
    if (user.role === 'admin') {
      return next()
    }

    // ⛔ Usuario autenticado pero sin privilegios de admin
    return res.status(403).json({
      ok: false,
      message: '⛔ Acceso denegado. Esta operación requiere privilegios de administrador.'
    })
  } catch (err) {
    // ❌ Error inesperado en el middleware
    console.error('❌ Error en adminOnly middleware:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al verificar permisos de administrador',
      error: err.message
    })
  }
}

export default adminOnly
