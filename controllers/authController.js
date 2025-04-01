const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 🔐 Generar token con username
const generateToken = (username) => {
  return jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// 🧾 Login de administrador
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (username === 'admin' && password === 'admin2025') {
      const token = generateToken(username); // ✅ se pasa "admin"
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = {
  loginAdmin,
};
