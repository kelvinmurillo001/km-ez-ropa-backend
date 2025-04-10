// middleware/adminOnly.js

/**
 * 🔒 Middleware para restringir acceso solo a usuarios con rol "admin"
 */
const adminOnly = (req, res, next) => {
  // ✅ Verifica que exista un usuario y que tenga el rol correcto
  if (req.user && req.user.role === 'admin') {
    return next(); // Acceso permitido
  }

  // 🚫 Acceso denegado
  return res.status(403).json({
    message: 'Acceso denegado. Solo administradores.',
  });
};

module.exports = adminOnly;
