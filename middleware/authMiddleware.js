// 📁 backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

/**
 * 🔐 Middleware híbrido:
 * Verifica autenticación por JWT (Bearer) o por sesión activa (Passport - Google)
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = String(req.headers.authorization || '').trim();

    // ✅ Si llega un token JWT en el encabezado
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.split(' ')[1];

      if (!token || token.length < 30) {
        logger.warn('⛔ Token JWT sospechosamente corto');
        return res.status(401).json({ ok: false, message: '⛔ Token inválido o ausente.' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, config.jwtSecret);
      } catch (err) {
        logger.warn(`⛔ JWT inválido: ${err.message}`);
        return res.status(401).json({ ok: false, message: '⛔ Token expirado o inválido.' });
      }

      const user = await User.findById(decoded.id).select('-password -refreshToken').lean();
      if (!user || user.banned || user.deleted) {
        logger.warn(`🚫 Usuario inválido o eliminado: ${decoded.id}`);
        return res.status(403).json({ ok: false, message: '🚫 Acceso denegado.' });
      }

      req.user = user;
      return next();
    }

    // ✅ Si tiene sesión activa por Google/Passport
    if (req.isAuthenticated?.() && req.user) {
      req.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      };
      return next();
    }

    // ❌ No autenticado de ninguna forma
    logger.warn('🔒 Acceso no autenticado (sin token ni sesión)');
    return res.status(401).json({
      ok: false,
      message: '🔒 Debes iniciar sesión para acceder.'
    });

  } catch (err) {
    logger.error('❌ authMiddleware error:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno de autenticación.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

export default authMiddleware;
