/**
 * 🔒 Middleware que restringe el acceso a rutas solo a usuarios con rol "admin"
 */
const adminOnly = (req, res, next) => {
  try {
    const user = req.user;

    // 🧍‍♂️ Usuario no autenticado (authMiddleware debe haberlo agregado)
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: '🚫 No autenticado. Acceso restringido solo para administradores.'
      });
    }

    // ✅ Verificación de rol
    if (user.role === 'admin') {
      return next();
    }

    // ⛔ Usuario autenticado pero sin permisos suficientes
    return res.status(403).json({
      ok: false,
      message: '⛔ Acceso denegado. Se requiere rol de administrador.'
    });

  } catch (err) {
    console.error('❌ Error en adminOnly middleware:', err.message || err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al verificar permisos de administrador.'
    });
  }
};

module.exports = adminOnly;
