const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization?.trim();

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Acceso denegado. Token no proporcionado o mal formado.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Usuario no válido' });
    }

    req.user = user; // 🔐 Ahora puedes acceder a req.user.name, etc.
    next();
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    return res.status(401).json({
      message: 'Token inválido o expirado.',
    });
  }
};

module.exports = authMiddleware;
