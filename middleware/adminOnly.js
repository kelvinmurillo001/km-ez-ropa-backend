// 📁 backend/middleware/adminOnly.js

/**
 * 🔒 Middleware: Solo permite acceso a usuarios con rol "admin"
 */
const adminOnly = (req, res, next) => {
  try {
    const user = req.user;

    // 🚫 Usuario no autenticado
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: '🚫 Acceso no autorizado. Debes iniciar sesión como administrador.'
      });
    }

    // ✅ Validar rol de administrador
    const rol = user.role?.toString().trim().toLowerCase();
    if (rol === 'admin') return next();

    // ⛔ Usuario autenticado pero sin permisos suficientes
    return res.status(403).json({
      ok: false,
      message: '⛔ Acción denegada. Solo los administradores pueden realizar esta operación.'
    });
  } catch (error) {
    // ❌ Error inesperado
    console.error('❌ Error en adminOnly middleware:', error);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al validar permisos de administrador',
      error: error.message
    });
  }
};

export default adminOnly;
