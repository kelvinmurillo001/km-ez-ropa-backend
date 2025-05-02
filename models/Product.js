import mongoose from 'mongoose'

// ✅ Subesquema para variantes
const variantSchema = new mongoose.Schema({
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
    required: [true, '⚠️ Imagen de variante obligatoria'],
    trim: true,
    match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg|avif)$/i, '⚠️ URL de imagen inválida']
  },
  cloudinaryId: {
    type: String,
    required: [true, '⚠️ cloudinaryId obligatorio'],
    trim: true
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, '⚠️ El stock no puede ser negativo']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, { _id: false })

// ✅ Esquema principal del producto
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '⚠️ El nombre del producto es obligatorio'],
    trim: true,
    minlength: [2, '⚠️ Mínimo 2 caracteres'],
    maxlength: [100, '⚠️ Máximo 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    default: 'Sin descripción disponible'
  },
  price: {
    type: Number,
    required: [true, '⚠️ El precio es obligatorio'],
    min: [0, '⚠️ El precio no puede ser negativo']
  },
  category: {
    type: String,
    required: [true, '⚠️ La categoría es obligatoria'],
    trim: true,
    lowercase: true
  },
  subcategory: {
    type: String,
    required: [true, '⚠️ La subcategoría es obligatoria'],
    trim: true,
    lowercase: true,
    minlength: [2, '⚠️ Mínimo 2 caracteres']
  },
  tallaTipo: {
    type: String,
    required: [true, '⚠️ El tipo de talla es obligatorio'],
    enum: ['adulto', 'joven', 'niño', 'niña', 'bebé'],
    trim: true,
    lowercase: true
  },
  sizes: {
    type: [String],
    default: [],
    validate: {
      validator: (val) => val.every((t) => typeof t === 'string' && t.trim().length > 0),
      message: '⚠️ Cada talla debe ser texto válido'
    }
  },
  color: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  images: {
    type: [{
      url: {
        type: String,
        required: [true, '⚠️ La imagen necesita una URL'],
        trim: true,
        match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg|avif)$/i, '⚠️ URL inválida']
      },
      cloudinaryId: {
        type: String,
        required: [true, '⚠️ cloudinaryId requerido'],
        trim: true
      },
      talla: {
        type: String,
        required: [true, '⚠️ Talla de imagen requerida'],
        trim: true,
        lowercase: true
      },
      color: {
        type: String,
        required: [true, '⚠️ Color de imagen requerido'],
        trim: true,
        lowercase: true
      }
    }],
    validate: {
      validator: (val) => Array.isArray(val) && val.length >= 1,
      message: '⚠️ Debes proporcionar al menos una imagen'
    }
  },
  variants: {
    type: [variantSchema],
    validate: [
      {
        validator: (val) => val.length <= 4,
        message: '⚠️ Máximo 4 variantes por producto'
      },
      {
        validator: function (val) {
          const seen = new Set()
          for (const v of val) {
            const key = `${v.talla}-${v.color}`
            if (seen.has(key)) return false
            seen.add(key)
          }
          return true
        },
        message: '⚠️ No puede haber variantes duplicadas (talla + color)'
      }
    ],
    default: []
  },
  stock: {
    type: Number,
    min: 0,
    default: 0
  },
  createdBy: {
    type: String,
    required: [true, '⚠️ Campo createdBy requerido'],
    trim: true,
    default: 'admin'
  },
  updatedBy: {
    type: String,
    trim: true,
    default: ''
  },
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
}, { timestamps: true })

// ✅ Virtual: stockTotal
productSchema.virtual('stockTotal').get(function () {
  if (this.variants?.length > 0) {
    return this.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
  }
  return this.stock || 0
})

productSchema.set('toJSON', { virtuals: true })
productSchema.set('toObject', { virtuals: true })

// 🧠 Hook pre-save
productSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    const normalized = this.name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .substring(0, 100)
    this.slug = normalized
  }

  if (!this.metaDescription && this.name && this.category) {
    this.metaDescription = `Compra ${this.name} en nuestra sección de ${this.category}. ¡Calidad garantizada en KM & EZ ROPA!`
  }

  next()
})

// 🧠 Índices
productSchema.index({ name: 1, category: 1, subcategory: 1 }, { background: true })
productSchema.index({ category: 1, subcategory: 1, tallaTipo: 1 })

// 🚀 Exportar modelo
const Product = mongoose.model('Product', productSchema)
export default Product
