const mongoose = require('mongoose');

// 📦 Esquema del producto
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Hombre', 'Mujer', 'Niño', 'Niña', 'Bebé', 'Interior', 'Casual', 'Informal']
  },
  subcategory: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    default: ""
  }
}, {
  timestamps: true // 🕒 Agrega createdAt y updatedAt automáticamente
});

// Exportar el modelo
module.exports = mongoose.model('Product', productSchema);
