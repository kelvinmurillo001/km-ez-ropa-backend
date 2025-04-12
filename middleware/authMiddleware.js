const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '🔐 Token no proporcionado o mal formado' });
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (!token || token.length < 10) {
      return res.status(401).json({ message: '🔒 Token inválido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔓 Usuario autenticado:", decoded); // Puedes eliminar esto en producción

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: '⛔ Usuario no encontrado o eliminado' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Error autenticando JWT:', error.message);
    return res.status(401).json({ message: '⛔ Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
