// 📁 backend/middleware/adminOnly.js

/**
 * 🔒 Middleware: Solo permite acceso a usuarios con rol "admin"
 */
const adminOnly = (req, res, next) => {
  try {
    const user = req.user;

    // 🚫 No autenticado
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: '🚫 Acceso no autorizado. Inicia sesión como administrador.'
      });
    }

    // ✅ Validación de rol exacto
    if (typeof user.role === 'string' && user.role.trim().toLowerCase() === 'admin') {
      return next();
    }

    // ⛔ Usuario autenticado pero sin privilegios de administrador
    return res.status(403).json({
      ok: false,
      message: '⛔ Acceso denegado. Esta acción solo está permitida para administradores.'
    });
  } catch (err) {
    // ❌ Fallo inesperado en el middleware
    console.error('❌ Error en adminOnly middleware:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al verificar permisos de administrador',
      error: err.message
    });
  }
};

export default adminOnly;
