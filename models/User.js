// 📁 backend/models/User.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, '⚠️ El nombre de usuario es obligatorio'],
      unique: true,
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
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password
        delete ret.refreshToken
        return ret
      }
    }
  }
)

/* 🔒 Hashear contraseña si fue modificada */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    console.error('❌ Error al hashear contraseña:', err)
    next(err)
  }
})

/* 🔑 Comparar contraseña ingresada con la guardada */
userSchema.methods.matchPassword = async function (inputPassword) {
  if (!this.password) return false
  return await bcrypt.compare(inputPassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User
