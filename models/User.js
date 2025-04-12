const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // 🆔 Usuario único
    username: {
      type: String,
      required: [true, '⚠️ El nombre de usuario es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, '⚠️ El usuario debe tener al menos 3 caracteres']
    },

    // 🙋‍♂️ Nombre completo
    name: {
      type: String,
      required: [true, '⚠️ El nombre es obligatorio'],
      trim: true
    },

    // 📧 Email
    email: {
      type: String,
      required: [true, '⚠️ El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, '⚠️ Email inválido']
    },

    // 🔐 Contraseña
    password: {
      type: String,
      required: [true, '⚠️ La contraseña es obligatoria'],
      minlength: [6, '⚠️ La contraseña debe tener al menos 6 caracteres'],
      select: false // 🔒 nunca devolverla por defecto
    },

    // 🎓 Rol de usuario
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    }
  },
  {
    timestamps: true // 🕒 createdAt / updatedAt
  }
);

// 🔐 Hashear contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error('❌ Error al hashear contraseña:', err);
    next(err);
  }
});

// 🔑 Método para comparar contraseñas
userSchema.methods.matchPassword = async function (enteredPassword) {
  return this.password ? await bcrypt.compare(enteredPassword, this.password) : false;
};

module.exports = mongoose.model('User', userSchema);
