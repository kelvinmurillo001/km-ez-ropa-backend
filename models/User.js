// 📁 backend/models/User.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// 🧩 Esquema de usuarios
const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      default: null
    },
    username: {
      type: String,
      trim: true,
      minlength: [3, '⚠️ Mínimo 3 caracteres']
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
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, '⚠️ Formato de email inválido']
    },
    password: {
      type: String,
      minlength: [6, '⚠️ Debe tener al menos 6 caracteres'],
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'client'],
      default: 'client'
    },
    refreshToken: {
      type: String,
      default: null,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password
        delete ret.refreshToken
        return ret
      }
    },
    toObject: {
      transform: (_, ret) => {
        delete ret.password
        delete ret.refreshToken
        return ret
      }
    }
  }
)

/**
 * ✅ Validación condicional:
 * Si no se usa Google (googleId), se requiere password
 */
userSchema.pre('validate', function (next) {
  if (!this.googleId && !this.password) {
    this.invalidate('password', '⚠️ Se requiere contraseña si no usas Google')
  }
  next()
})

/**
 * 🔒 Hashear contraseña automáticamente si fue modificada
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    console.error('❌ Error al hashear contraseña:', err)
    next(err)
  }
})

/**
 * 🔑 Método para comparar contraseñas
 */
userSchema.methods.matchPassword = async function (inputPassword) {
  if (!this.password) return false
  return await bcrypt.compare(inputPassword, this.password)
}

// 🚀 Exportar modelo
const User = mongoose.model('User', userSchema)
export default User
