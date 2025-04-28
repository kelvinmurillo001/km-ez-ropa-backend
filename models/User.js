// 📁 backend/models/User.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// 📋 Esquema de usuario
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, '⚠️ El nombre de usuario es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, '⚠️ El usuario debe tener al menos 3 caracteres']
    },
    name: {
      type: String,
      required: [true, '⚠️ El nombre es obligatorio'],
      trim: true,
      minlength: [2, '⚠️ Mínimo 2 caracteres'],
      maxlength: [100, '⚠️ Máximo 100 caracteres']
    },
    email: {
      type: String,
      required: [true, '⚠️ El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, '⚠️ Email inválido']
    },
    password: {
      type: String,
      required: [true, '⚠️ La contraseña es obligatoria'],
      minlength: [6, '⚠️ Debe tener al menos 6 caracteres'],
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user'
    },
    refreshToken: {
      type: String,
      default: null,
      select: false
    }
  },
  {
    timestamps: true
  }
)

/* -------------------------------------------------------------------------- */
/* 🔒 Middleware: Hashear contraseña antes de guardar                         */
/* -------------------------------------------------------------------------- */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    console.error('❌ Error al hashear contraseña:', err)
    next(err)
  }
})

/* -------------------------------------------------------------------------- */
/* 🔑 Método de instancia: Comparar contraseñas                               */
/* -------------------------------------------------------------------------- */
userSchema.methods.matchPassword = async function (inputPassword) {
  return this.password ? await bcrypt.compare(inputPassword, this.password) : false
}

// 🚀 Exportar modelo
const User = mongoose.model('User', userSchema)
export default User
