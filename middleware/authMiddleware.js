// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 🔐 Middleware para proteger rutas usando JWT
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization?.trim();

  // 📛 Verifica si el token está presente y bien formado
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado o mal formado' });
  }

  const token = authHeader.split(' ')[1]; // Extrae el token real

  try {
    // 🔍 Verifica y decodifica el token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👤 Busca el usuario en la base de datos y excluye el campo de contraseña
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Usuario inválido o no existe' });
    }

    // ✅ Usuario autenticado correctamente, se agrega al objeto req
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Error al verificar JWT:', error.message);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
