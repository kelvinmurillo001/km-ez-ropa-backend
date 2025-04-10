// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 🔐 Middleware para proteger rutas mediante JWT
 * - Valida y decodifica token
 * - Busca usuario
 * - Adjunta usuario a req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 📛 Validación del header: debe ser Bearer token
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '🔐 Token no proporcionado o mal formado' });
    }

    const token = authHeader.split(' ')[1]?.trim();

    // ❗ Validación adicional por si el token está vacío
    if (!token || token.length < 10) {
      return res.status(401).json({ message: '🔒 Token inválido' });
    }

    // 🔍 Verificar token con clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👤 Buscar usuario y excluir contraseña
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: '⛔ Usuario no encontrado o eliminado' });
    }

    // ✅ Token válido, usuario existente → continuar
    req.user = user;
    next();

  } catch (error) {
    console.error('❌ Error autenticando JWT:', error.message);
    return res.status(401).json({ message: '⛔ Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
