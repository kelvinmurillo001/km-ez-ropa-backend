/**
 * 🔒 Middleware para restringir el acceso a rutas solo para administradores
 */
const adminOnly = (req, res, next) => {
  try {
    const user = req.user;

    // 🔐 Verificar autenticación
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: '🚫 No autenticado. Se requiere login de administrador.'
      });
    }

    // ✅ Verificación de rol
    if (user.role === 'admin') {
      return next();
    }

    // ⛔ Usuario autenticado pero no es admin
    return res.status(403).json({
      ok: false,
      message: '⛔ Acceso denegado. Esta operación requiere privilegios de administrador.'
    });

  } catch (err) {
    console.error('❌ Error en adminOnly middleware:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al verificar permisos de administrador',
      error: err.message
    });
  }
};

module.exports = adminOnly;
