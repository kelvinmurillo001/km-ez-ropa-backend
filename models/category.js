// 📁 backend/models/category.js
import mongoose from 'mongoose'

// 📦 Esquema de Categoría con subcategorías embebidas
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '⚠️ El nombre de la categoría es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [2, '⚠️ El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, '⚠️ El nombre no debe superar los 50 caracteres']
  },

  subcategories: {
    type: [String],
    default: [],
    validate: {
      validator: arr =>
        Array.isArray(arr) &&
        arr.every(sub => typeof sub === 'string' && sub.trim().length >= 2),
      message: '⚠️ Cada subcategoría debe tener al menos 2 caracteres'
    },
    set: arr => Array.isArray(arr)
      ? [...new Set(arr.map(sub => sub.trim().toLowerCase()))] // 🔄 Evita duplicados y normaliza
      : []
  },

  icon: {
    type: String,
    trim: true,
    default: ''
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString()
      delete ret._id
      return ret
    }
  },
  toObject: {
    virtuals: true,
    versionKey: false
  }
})

// 🔍 Índice con collation para búsquedas sin importar acentos o mayúsculas
categorySchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: 'es', strength: 2 } // 📌 Ignora mayúsculas y tildes
  }
)

// 🚀 Exportar modelo
const Category = mongoose.model('Category', categorySchema)
export default Category
