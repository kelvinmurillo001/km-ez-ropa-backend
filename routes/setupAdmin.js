// routes/setupAdmin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ⚠️ Ruta solo para setup inicial (eliminar después de usar)
router.get('/', async (req, res) => {
  try {
    const existe = await User.findOne({ username: 'admin' });

    if (existe) {
      return res.status(200).json({ message: 'ℹ️ Admin ya existe' });
    }

    const nuevoAdmin = await User.create({
      username: 'admin',
      name: 'Administrador',
      email: 'admin@km-ez.com',
      password: 'admin2025', // 🔐 Será encriptada automáticamente
      role: 'admin'
    });

    res.status(201).json({ message: '✅ Admin creado', user: nuevoAdmin.username });
  } catch (err) {
    console.error('❌ Error en setup-admin:', err);
    res.status(500).json({ message: 'Error creando admin' });
  }
});

module.exports = router;
