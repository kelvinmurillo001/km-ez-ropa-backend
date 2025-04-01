const jwt = require('jsonwebtoken');

// 🔐 Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ⚠️ Si no hay header o formato incorrecto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado o mal formado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ✅ Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Se puede acceder luego en req.user
    next();
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = authMiddleware;
