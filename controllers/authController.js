// controllers/authController.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 🎟️ Genera un token JWT válido por 7 días
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * 🔐 Login de administrador con validación robusta
 */
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  // 🛡️ Validación de entrada
  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ message: '⚠️ Nombre de usuario inválido o incompleto' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: '⚠️ Contraseña inválida o muy corta' });
  }

  try {
    // 🔍 Buscar al usuario incluyendo la contraseña explícitamente
    const user = await User.findOne({ username: username.trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: '❌ Usuario no encontrado' });
    }

    // 🚫 Solo administradores
    if (user.role !== 'admin') {
      return res.status(403).json({ message: '⛔ Solo los administradores pueden ingresar' });
    }

    // 🔐 Comparar contraseñas de forma segura
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: '❌ Contraseña incorrecta' });
    }

    // ✅ Login exitoso
    const token = generateToken(user);

    return res.status(200).json({
      message: '✅ Login exitoso',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Error en login:', error.message || error);
    return res.status(500).json({ message: '❌ Error interno del servidor' });
  }
};

module.exports = { loginAdmin };
