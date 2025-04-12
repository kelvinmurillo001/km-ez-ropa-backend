const mongoose = require('mongoose');

// 📦 Esquema de producto con variantes por talla y color
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '⚠️ El nombre del producto es obligatorio'],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, '⚠️ El precio es obligatorio'],
      min: [0, '⚠️ El precio no puede ser negativo']
    },

    category: {
      type: String,
      required: [true, '⚠️ La categoría es obligatoria'],
      enum: ['Hombre', 'Mujer', 'Niño', 'Niña', 'Bebé', 'Interior', 'Casual', 'Informal'],
      trim: true
    },

    subcategory: {
      type: String,
      required: [true, '⚠️ La subcategoría es obligatoria'],
      trim: true,
      lowercase: true
    },

    tallaTipo: {
      type: String,
      required: [true, '⚠️ El tipo de talla es obligatorio'],
      enum: ['adulto', 'niño', 'niña', 'bebé'],
      lowercase: true,
      trim: true
    },

    stock: {
      type: Number,
      required: [true, '⚠️ El stock es obligatorio'],
      min: [0, '⚠️ El stock no puede ser negativo']
    },

    featured: {
      type: Boolean,
      default: false
    },

    // 🖼️ Imágenes principales (obligatoria una sola imagen)
    images: {
      type: [
        {
          url: {
            type: String,
            required: [true, '⚠️ La imagen debe tener una URL válida'],
            trim: true,
            match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i, '⚠️ URL de imagen inválida']
          },
          cloudinaryId: {
            type: String,
            required: [true, '⚠️ cloudinaryId obligatorio'],
            trim: true
          }
        }
      ],
      validate: {
        validator: val => Array.isArray(val) && val.length === 1,
        message: '⚠️ Solo se permite exactamente una imagen principal.'
      }
    },

    // 🎨 Variantes
    variants: {
      type: [
        {
          talla: {
            type: String,
            required: [true, '⚠️ La talla es obligatoria'],
            trim: true,
            lowercase: true
          },
          color: {
            type: String,
            required: [true, '⚠️ El color es obligatorio'],
            trim: true,
            lowercase: true
          },
          imageUrl: {
            type: String,
            required: [true, '⚠️ La imagen es obligatoria'],
            trim: true,
            match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i, '⚠️ URL de imagen de variante inválida']
          },
          cloudinaryId: {
            type: String,
            required: [true, '⚠️ cloudinaryId de variante obligatorio'],
            trim: true
          },
          stock: {
            type: Number,
            default: 0,
            min: [0, '⚠️ El stock no puede ser negativo']
          }
        }
      ],
      validate: {
        validator: val => val.length <= 4,
        message: '⚠️ Máximo 4 variantes por producto.'
      },
      default: []
    },

    createdBy: {
      type: String,
      required: [true, '⚠️ Campo createdBy requerido'],
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

// 🔍 Índices
productSchema.index({ name: 'text', category: 1, subcategory: 1 });

module.exports = mongoose.model('Product', productSchema);
