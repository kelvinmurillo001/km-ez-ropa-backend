const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🎟️ Genera token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 🔐 Login seguro con validación por username
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    // ❌ Usuario no encontrado o no es admin
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: '❌ Credenciales inválidas' });
    }

    // ❌ Contraseña incorrecta
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '❌ Credenciales inválidas' });
    }

    // ✅ Generar token y responder
    const token = generateToken(user);
    res.status(200).json({
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
