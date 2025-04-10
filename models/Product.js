const mongoose = require('mongoose');

// 📦 Esquema de producto con variantes por talla y color
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    category: {
      type: String,
      required: true,
      enum: ['Hombre', 'Mujer', 'Niño', 'Niña', 'Bebé', 'Interior', 'Casual', 'Informal'],
      trim: true
    },

    subcategory: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
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

    // 🖼️ Imágenes principales (galería del producto)
    images: [
      {
        url: {
          type: String,
          required: true,
          trim: true,
          match: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i
        },
        cloudinaryId: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],

    // 🎨 Variantes con talla/color, imagen individual y stock
    variants: [
      {
        talla: {
          type: String,
          required: true,
          trim: true,
          lowercase: true
        },
        color: {
          type: String,
          required: true,
          trim: true,
          lowercase: true
        },
        imageUrl: {
          type: String,
          required: true,
          trim: true,
          match: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i
        },
        cloudinaryId: {
          type: String,
          required: true,
          trim: true
        },
        stock: {
          type: Number,
          default: 0,
          min: 0
        }
      }
    ],

    createdBy: {
      type: String,
      required: true,
      trim: true
    },

    updatedBy: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true // ⏱️ createdAt y updatedAt automáticos
  }
);

// 🔍 Índice de búsqueda para nombre y categorías
productSchema.index({ name: 'text', category: 1, subcategory: 1 });

module.exports = mongoose.model('Product', productSchema);
