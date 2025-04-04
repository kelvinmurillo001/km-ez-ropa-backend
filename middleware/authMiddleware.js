const jwt = require('jsonwebtoken');

// 🔐 Middleware de autenticación para rutas protegidas
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization?.trim();

  // ⚠️ Validación básica del header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Acceso denegado. Token no proporcionado o mal formado.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ✅ Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 📌 Añadir usuario decodificado a la request
    req.user = decoded;

    next();
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    return res.status(401).json({
      message: 'Token inválido o expirado.'
    });
  }
};

module.exports = authMiddleware;
