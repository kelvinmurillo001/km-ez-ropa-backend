// middleware/adminOnly.js

/**
 * 🔒 Middleware que restringe el acceso a rutas solo a usuarios con rol "admin"
 */
const adminOnly = (req, res, next) => {
  try {
    // 🧍‍♂️ Validar existencia de usuario y su rol
    if (!req.user || typeof req.user !== 'object') {
      return res.status(401).json({ message: 'No autenticado. Acceso restringido.' });
    }

    // ✅ Usuario autenticado con rol adecuado
    if (req.user.role === 'admin') {
      return next();
    }

    // 🚫 Usuario autenticado pero sin rol de admin
    return res.status(403).json({ message: '⛔ Acceso denegado. Solo administradores.' });

  } catch (err) {
    console.error('❌ Error en middleware adminOnly:', err);
    return res.status(500).json({ message: '❌ Error interno del servidor' });
  }
};

module.exports = adminOnly;
