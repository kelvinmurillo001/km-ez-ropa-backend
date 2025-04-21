const mongoose = require("mongoose");

// ✅ Subesquema para variantes (cada color/talla con su propio stock)
const variantSchema = new mongoose.Schema({
  talla: {
    type: String,
    required: [true, "⚠️ La talla es obligatoria"],
    trim: true,
    lowercase: true
  },
  color: {
    type: String,
    required: [true, "⚠️ El color es obligatorio"],
    trim: true,
    lowercase: true
  },
  imageUrl: {
    type: String,
    required: [true, "⚠️ La imagen de la variante es obligatoria"],
    trim: true,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg|avif)$/i, "⚠️ URL de imagen inválida"]
  },
  cloudinaryId: {
    type: String,
    required: [true, "⚠️ cloudinaryId obligatorio"],
    trim: true
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, "⚠️ El stock no puede ser negativo"]
  }
}, { _id: false });

// ✅ Esquema principal del producto
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "⚠️ El nombre del producto es obligatorio"],
    trim: true,
    minlength: [2, "⚠️ Mínimo 2 caracteres"],
    maxlength: [100, "⚠️ Máximo 100 caracteres"]
  },
  price: {
    type: Number,
    required: [true, "⚠️ El precio es obligatorio"],
    min: [0, "⚠️ El precio no puede ser negativo"]
  },
  category: {
    type: String,
    required: [true, "⚠️ La categoría es obligatoria"],
    trim: true,
    lowercase: true
  },
  subcategory: {
    type: String,
    required: [true, "⚠️ La subcategoría es obligatoria"],
    trim: true,
    lowercase: true,
    minlength: [2, "⚠️ Mínimo 2 caracteres"]
  },
  tallaTipo: {
    type: String,
    required: [true, "⚠️ El tipo de talla es obligatorio"],
    enum: ["adulto", "niño", "niña", "bebé"],
    trim: true,
    lowercase: true
  },

  // 🗑️ ⛔ Stock eliminado del producto principal

  featured: {
    type: Boolean,
    default: false
  },

  // 📸 Imagen principal (1 requerida)
  images: {
    type: [{
      url: {
        type: String,
        required: [true, "⚠️ La imagen principal necesita una URL"],
        trim: true,
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg|avif)$/i, "⚠️ URL inválida"]
      },
      cloudinaryId: {
        type: String,
        required: [true, "⚠️ cloudinaryId requerido"],
        trim: true
      },
      talla: {
        type: String,
        required: [true, "⚠️ Talla de imagen requerida"],
        trim: true,
        lowercase: true
      },
      color: {
        type: String,
        required: [true, "⚠️ Color de imagen requerido"],
        trim: true,
        lowercase: true
      }
    }],
    validate: {
      validator: (val) => Array.isArray(val) && val.length === 1,
      message: "⚠️ Debes proporcionar exactamente 1 imagen principal"
    }
  },

  // 👕 Variantes con color + talla + stock
  variants: {
    type: [variantSchema],
    validate: [
      {
        validator: val => val.length <= 4,
        message: "⚠️ Máximo 4 variantes por producto"
      },
      {
        validator: function (val) {
          const seen = new Set();
          for (const v of val) {
            const key = `${v.talla}-${v.color}`;
            if (seen.has(key)) return false;
            seen.add(key);
          }
          return true;
        },
        message: "⚠️ No puede haber variantes duplicadas (talla + color)"
      }
    ],
    default: []
  },

  // 🧠 Auditoría
  createdBy: {
    type: String,
    required: [true, "⚠️ Campo createdBy requerido"],
    trim: true,
    default: "admin"
  },
  updatedBy: {
    type: String,
    default: "",
    trim: true
  },

  // 🔍 SEO opcionales
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: 160
  }

}, {
  timestamps: true
});

// 🔎 Búsqueda rápida
productSchema.index({ name: "text", category: 1, subcategory: 1 });

module.exports = mongoose.model("Product", productSchema);
