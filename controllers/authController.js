const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🎟️ Genera token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 🔐 Login seguro con validación
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // ❌ Usuario no encontrado o no admin
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
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('❌ Error en login:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { loginAdmin };
