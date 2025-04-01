const jwt = require('jsonwebtoken');

// 🔐 Middleware de autenticación
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 📛 Verificar si el token fue proporcionado
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 🔍 Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ Guardar usuario decodificado en req.user
    next(); // 👉 Continuar al siguiente middleware o ruta protegida
  } catch (error) {
    console.error('❌ Token inválido o expirado:', error.message);
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = auth;
