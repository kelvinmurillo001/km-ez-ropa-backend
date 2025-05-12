// 📁 backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      default: null,
      trim: true
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      minlength: [3, '⚠️ El nombre de usuario debe tener al menos 3 caracteres'],
      sparse: true
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
      minlength: [6, '⚠️ La contraseña debe tener al menos 6 caracteres'],
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
    },
    banned: {
      type: Boolean,
      default: false
    },
    deleted: {
      type: Boolean,
      default: false
    },

    // 🔐 Campos para recuperación de contraseña
    resetToken: {
      type: String,
      default: null,
      select: false
    },
    resetExpires: {
      type: Date,
      default: null,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        delete ret.resetToken;
        delete ret.resetExpires;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        delete ret.resetToken;
        delete ret.resetExpires;
        return ret;
      }
    }
  }
);

// ✅ Normalización de datos antes de validar
userSchema.pre('validate', function (next) {
  if (this.name) this.name = this.name.trim();
  if (this.email) this.email = this.email.toLowerCase().trim();
  if (this.username) this.username = this.username.toLowerCase().trim();

  if (!this.googleId && !this.password) {
    this.invalidate('password', '⚠️ Se requiere contraseña si no usas autenticación de Google');
  }

  next();
});

// 🔐 Encriptar contraseña si fue modificada
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error('❌ Error al hashear contraseña:', err);
    next(err);
  }
});

// 🔑 Comparación de contraseña
userSchema.methods.matchPassword = async function (inputPassword) {
  if (!this.password || !inputPassword) return false;
  return await bcrypt.compare(inputPassword, this.password);
};

// 📌 Índices para consultas rápidas y seguridad
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

const User = mongoose.model('User', userSchema);
export default User;
