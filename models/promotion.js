// 📁 backend/models/promotion.js
import mongoose from 'mongoose'

// 🌐 Páginas válidas donde se puede mostrar una promoción
const allowedPages = ['home', 'categorias', 'productos', 'detalle', 'carrito', 'checkout']

// 🏷️ Esquema de promoción publicitaria
const promotionSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, '⚠️ El mensaje de la promoción es obligatorio'],
      trim: true,
      minlength: [3, '⚠️ El mensaje debe tener al menos 3 caracteres']
    },
    active: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      enum: ['blue', 'orange', 'green', 'red'],
      default: 'blue',
      lowercase: true,
      trim: true
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    mediaUrl: {
      type: String,
      default: null,
      trim: true,
      validate: {
        validator: url =>
          !url || /^https?:\/\/.+\.(jpg|jpeg|png|webp|mp4|gif|svg|avif)$/i.test(url),
        message: '⚠️ URL de multimedia no válida (debe ser imagen o video)'
      }
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', null],
      default: null
    },
    pages: {
      type: [String],
      default: [],
      validate: {
        validator: arr => arr.every(p => allowedPages.includes(p)),
        message: '⚠️ Una o más páginas no son válidas para promociones'
      }
    },
    position: {
      type: String,
      enum: ['top', 'middle', 'bottom'],
      default: 'top',
      lowercase: true,
      trim: true
    },
    createdBy: {
      type: String,
      trim: true,
      default: 'admin'
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true // 📅 createdAt y updatedAt automáticos
  }
)

// 🔍 Índice para filtrar promociones activas más fácilmente
promotionSchema.index({ active: 1, startDate: 1, endDate: 1 })

// 🔁 Hook para crear un slug automáticamente basado en el mensaje
promotionSchema.pre('save', function (next) {
  if (!this.slug && this.message) {
    this.slug = this.message
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '') // ← FIX aplicado aquí
      .substring(0, 100)
  }
  next()
})

// 🚀 Exportar el modelo
const Promotion = mongoose.model('Promotion', promotionSchema)
export default Promotion
