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

    // 🛡️ Verificar que el header existe y tiene formato válido
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        message: '🔐 Token de autorización no proporcionado o mal formado'
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token || token.length < 10) {
      return res.status(401).json({
        ok: false,
        message: '🔒 Token inválido o demasiado corto'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ JWT Error:', err.message || err);
      return res.status(401).json({
        ok: false,
        message: '⛔ Token expirado o inválido'
      });
    }

    // 📥 Buscar usuario sin exponer la contraseña
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: '⛔ Usuario no encontrado o eliminado'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('❌ Error en authMiddleware:', error.message || error);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno en la autenticación'
    });
  }
};

module.exports = authMiddleware;
