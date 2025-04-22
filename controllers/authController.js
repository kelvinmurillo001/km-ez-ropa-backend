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
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * 🔐 Login exclusivo para administradores
 * @route POST /api/auth/admin
 */
const loginAdmin = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const password = req.body.password;

    // 🧪 Validaciones iniciales
    if (!username || username.length < 3) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Nombre de usuario inválido o incompleto'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Contraseña inválida o muy corta'
      });
    }

    // 🔍 Buscar usuario y obtener contraseña
    const user = await User.findOne({ username }).select('+password');

    // 🛡️ Seguridad: nunca revelar si falló usuario o contraseña
    if (!user || user.role !== 'admin') {
      return res.status(401).json({
        ok: false,
        message: '❌ Credenciales inválidas o no autorizado'
      });
    }

    // 🔑 Verificar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        ok: false,
        message: '❌ Credenciales inválidas o no autorizado'
      });
    }

    // 🎫 Generar token
    const token = generateToken(user);

    return res.status(200).json({
      ok: true,
      message: '✅ Login exitoso',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error en loginAdmin:', error);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = { loginAdmin };
