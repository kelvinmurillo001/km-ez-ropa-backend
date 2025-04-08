// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 Middleware para proteger rutas mediante JWT
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization?.trim();

  // 🔎 Verifica si existe el encabezado y si comienza con 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado o mal formado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 🔓 Decodifica el token usando la clave secreta del entorno
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 Busca al usuario en la base de datos y excluye la contraseña
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Usuario inválido' });
    }

    // 💾 Añade el usuario autenticado al objeto de la solicitud
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ JWT error:', error.message);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
