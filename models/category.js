// 📁 backend/models/Category.js
import mongoose from 'mongoose'

// 📦 Esquema de Categoría con subcategorías embebidas
const categorySchema = new mongoose.Schema(
  {
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
        validator: (arr) => arr.every(sub => typeof sub === 'string' && sub.trim().length >= 2),
        message: '⚠️ Cada subcategoría debe ser una cadena válida de al menos 2 caracteres'
      },
      set: (arr) => arr.map(sub => sub.trim().toLowerCase())
    }
    // 🧩 Futuras mejoras (comentadas para desarrollo futuro):
    // icon: { type: String, trim: true },
    // isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true // 🕒 createdAt y updatedAt automáticos
  }
)

// 🔍 Índice único insensible a mayúsculas/minúsculas (strength:2)
categorySchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: 'es', strength: 2 }
  }
)

// 🚀 Exportar el modelo
const Category = mongoose.model('Category', categorySchema)
export default Category
