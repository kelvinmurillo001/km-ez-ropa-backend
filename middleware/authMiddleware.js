// 📁 backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * 🔐 Middleware: Verifica autenticación de usuarios mediante JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    // 📛 Validar formato del header
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        message: '🔐 Acceso denegado. Token no proporcionado o mal formado.'
      });
    }

    // 📦 Extraer token
    const token = authHeader.split(' ')[1];
    if (!token || token.length < 10) {
      return res.status(401).json({
        ok: false,
        message: '⛔ Token inválido o sospechosamente corto.'
      });
    }

    // 🔍 Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.warn('⛔ JWT inválido:', err.message);
      return res.status(401).json({
        ok: false,
        message: '⛔ Token expirado o inválido. Por favor inicia sesión nuevamente.'
      });
    }

    // 👤 Verificar existencia de usuario
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        ok: false,
        message: '🚫 Usuario no encontrado o eliminado del sistema.'
      });
    }

    // ✅ Autenticado
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Error en authMiddleware:', error);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al verificar autenticación.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default authMiddleware;
