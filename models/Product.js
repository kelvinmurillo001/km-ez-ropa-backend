// models/Product.js

const mongoose = require('mongoose');

// 📦 Esquema del producto con variantes por talla y color
const productSchema = new mongoose.Schema(
  {
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

    // 🖼️ Imágenes principales (no variantes)
    images: [
      {
        url: {
          type: String,
          required: true,
          match: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i
        },
        cloudinaryId: {
          type: String,
          required: true
        }
      }
    ],

    // 🎨 Variantes por talla y color con imagen individual
    variants: [
      {
        talla: { type: String, required: true },
        color: { type: String, required: true },
        imageUrl: {
          type: String,
          required: true,
          match: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i
        },
        cloudinaryId: {
          type: String,
          required: true
        },
        stock: {
          type: Number,
          default: 0
        }
      }
    ],

    createdBy: {
      type: String,
      required: true
    },

    updatedBy: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true // ⏱️ Crea automáticamente createdAt y updatedAt
  }
);

// 🔍 Índice para búsquedas por texto y categorías
productSchema.index({ name: 'text', category: 1, subcategory: 1 });

module.exports = mongoose.model('Product', productSchema);
