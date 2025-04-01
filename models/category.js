const mongoose = require("mongoose");

// 📦 Esquema de categoría con subcategorías embebidas como strings
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    subcategories: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true // 🕒 Agrega createdAt y updatedAt automáticamente
  }
);

// Exportar modelo de categoría
module.exports = mongoose.model("Category", categorySchema);
