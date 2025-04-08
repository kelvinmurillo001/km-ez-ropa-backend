// middleware/adminOnly.js

// 🔒 Middleware que permite solo usuarios con rol "admin"
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next(); // acceso permitido
  }

  // Acceso denegado
  return res.status(403).json({
    message: 'Acceso denegado. Solo administradores.',
  });
};

module.exports = adminOnly;
