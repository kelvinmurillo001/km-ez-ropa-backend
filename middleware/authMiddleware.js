const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 🔐 Middleware para proteger rutas con JWT
 * - Verifica y decodifica el token
 * - Busca al usuario y lo adjunta al objeto `req.user`
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🛡️ Verificar formato correcto: "Bearer <token>"
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '🔐 Token no proporcionado o mal formado' });
    }

    const token = authHeader.split(' ')[1]?.trim();

    // ❗ Token mínimo de longitud básica
    if (!token || token.length < 10) {
      return res.status(401).json({ message: '🔒 Token inválido' });
    }

    // 🔍 Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔎 Buscar usuario sin incluir contraseña
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: '⛔ Usuario no encontrado o eliminado' });
    }

    // ✅ Usuario válido → adjuntar al request y continuar
    req.user = user;
    return next();

  } catch (error) {
    console.error('❌ Error autenticando JWT:', error.message);
    return res.status(401).json({ message: '⛔ Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
