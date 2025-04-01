const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 👤 Esquema del usuario administrador
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true // 🕒 Crea createdAt y updatedAt automáticamente
});

// 🔐 Método para comparar contraseñas
userSchema.methods.matchPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

// 🔒 Encriptar contraseña antes de guardar (solo si fue modificada)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
