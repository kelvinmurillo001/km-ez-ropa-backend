const jwt = require('jsonwebtoken');

// 🔐 Generar token JWT
const generateToken = (username) => {
  return jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// 🧾 Login del administrador usando .env
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const ADMIN_USER = process.env.ADMIN_USER;
    const ADMIN_PASS = process.env.ADMIN_PASS;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = generateToken(username);
      return res.json({ token });
    }

    res.status(401).json({ message: 'Credenciales incorrectas' });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { loginAdmin };
