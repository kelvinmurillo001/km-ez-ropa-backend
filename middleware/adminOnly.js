/**
 * 🔒 Middleware que restringe el acceso a rutas solo a usuarios con rol "admin"
 */
const adminOnly = (req, res, next) => {
  try {
    // 🧍‍♂️ Verificar si el usuario está presente (desde authMiddleware)
    if (!req.user || typeof req.user !== 'object') {
      return res.status(401).json({ message: '🚫 No autenticado. Acceso restringido.' });
    }

    // ✅ Verificar que el usuario tenga rol de admin
    if (req.user.role === 'admin') {
      return next();
    }

    // ⛔ Usuario autenticado pero sin permiso suficiente
    return res.status(403).json({ message: '⛔ Acceso denegado. Solo administradores.' });

  } catch (err) {
    console.error('❌ Error en middleware adminOnly:', err.message || err);
    return res.status(500).json({ message: '❌ Error interno del servidor en validación de permisos.' });
  }
};

module.exports = adminOnly;
