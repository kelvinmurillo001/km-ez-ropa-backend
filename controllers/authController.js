const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 🎟️ Genera un token JWT válido por 7 días
 * Incluye ID, username y rol del usuario en el payload
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * 🔐 Login de administrador con validación de credenciales
 * - Verifica que exista el usuario
 * - Verifica que sea rol "admin"
 * - Compara contraseñas hasheadas
 * - Genera token JWT en caso exitoso
 */
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 🔎 Buscar usuario por username
    const user = await User.findOne({ username });

    // ❌ Usuario no encontrado o no es admin
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: '❌ Credenciales inválidas' });
    }

    // 🔐 Validar contraseña
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '❌ Credenciales inválidas' });
    }

    // ✅ Todo correcto → generar token
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
  } catch (err) {
    console.error('❌ Error en login:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { loginAdmin };
