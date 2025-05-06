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
  isActive: {
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
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    default: 'Sin descripción disponible'
  },
  price: {
    type: Number,
    required: [true, '⚠️ El precio es obligatorio'],
    min: 0
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
    minlength: 2
  },
  tallaTipo: {
    type: String,
    required: [true, '⚠️ El tipo de talla es obligatorio'],
    enum: ['adulto', 'joven', 'niño', 'niña', 'bebé'],
    trim: true,
    lowercase: true
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
    validate: [
      {
        validator: val => Array.isArray(val) && val.length >= 1,
        message: '⚠️ Debes proporcionar al menos una imagen'
      },
      {
        validator: val => {
          const seen = new Set()
          for (const img of val) {
            const key = `${img.talla}-${img.color}`
            if (seen.has(key)) return false
            seen.add(key)
          }
          return true
        },
        message: '⚠️ No puede haber imágenes duplicadas con la misma talla y color'
      }
    ]
  },
  variants: {
    type: [variantSchema],
    default: [],
    validate: [
      {
        validator: val => val.length <= 4,
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
    ]
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: String,
    required: true,
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
    lowercase: true,
    unique: true,
    maxlength: 100
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: 160
  }
}, { timestamps: true })

// 🧮 Virtual: stockTotal
productSchema.virtual('stockTotal').get(function () {
  return this.variants?.length > 0
    ? this.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : (this.stock || 0)
})

productSchema.set('toJSON', { virtuals: true })
productSchema.set('toObject', { virtuals: true })

// 🧠 Hook: Pre-validate para generar slug único
productSchema.pre('validate', async function (next) {
  if (!this.slug && this.name) {
    let slugBase = this.name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .substring(0, 100)

    let slug = slugBase
    let counter = 1

    while (await mongoose.models.Product.exists({ slug })) {
      slug = `${slugBase}-${counter++}`
    }

    this.slug = slug
  }

  if (!this.metaDescription && this.name && this.category) {
    this.metaDescription = `Compra ${this.name} en nuestra sección de ${this.category}. ¡Calidad garantizada en KM & EZ ROPA!`
  }

  next()
})

// 🔍 Índices para búsquedas optimizadas
productSchema.index({ name: 1, category: 1, subcategory: 1 }, { background: true })
productSchema.index({ category: 1, subcategory: 1, tallaTipo: 1 })

// 🚀 Exportar modelo
const Product = mongoose.model('Product', productSchema)
export default Product
