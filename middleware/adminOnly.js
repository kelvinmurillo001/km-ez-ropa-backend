const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
  
    return res.status(403).json({
      message: 'Acceso denegado. Solo administradores.'
    });
  };
  
  module.exports = adminOnly;
  