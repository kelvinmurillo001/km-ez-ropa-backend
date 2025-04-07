const mongoose = require('mongoose');

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

  // ✅ Variantes por talla y color con imagen y stock por variante
  variants: [
    {
      talla: { type: String, required: true },
      color: { type: String, required: true },
      imageUrl: { type: String, required: true },
      cloudinaryId: { type: String, required: true },
      stock: { type: Number, default: 0 }
    }
  ],

  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
