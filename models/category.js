const mongoose = require("mongoose");

// 📦 Esquema de categoría con subcategorías embebidas como strings
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '⚠️ El nombre de la categoría es obligatorio'],
      unique: true,
      trim: true,
      minlength: [2, '⚠️ El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, '⚠️ El nombre no debe superar los 50 caracteres']
    },
    subcategories: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every(sub => typeof sub === 'string' && sub.trim().length >= 2);
        },
        message: '⚠️ Cada subcategoría debe ser una cadena válida de al menos 2 caracteres'
      }
    }
  },
  {
    timestamps: true // 🕒 createdAt y updatedAt automáticos
  }
);

// 🔍 Índice único para evitar duplicados insensibles a mayúsculas
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'es', strength: 2 } });

// Exportar modelo
module.exports = mongoose.model("Category", categorySchema);
