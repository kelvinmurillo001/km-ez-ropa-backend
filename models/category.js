// 📁 backend/models/Category.js
import mongoose from 'mongoose'

// 📦 Esquema de categoría con subcategorías embebidas
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
        validator: function (arr) {
          return arr.every(
            sub => typeof sub === 'string' && sub.trim().length >= 2
          )
        },
        message:
          '⚠️ Cada subcategoría debe ser una cadena válida de al menos 2 caracteres'
      },
      set: function (arr) {
        return arr.map(sub => sub.trim().toLowerCase())
      }
    }

    // 🧩 Futuras mejoras:
    // icon: { type: String, trim: true },
    // isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true // 🕒 createdAt y updatedAt automáticos
  }
)

// 🔍 Índice único e insensible a mayúsculas/minúsculas
categorySchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: 'es', strength: 2 } // fuerza 2 ignora acentos y case
  }
)

const Category = mongoose.model('Category', categorySchema)
export default Category
