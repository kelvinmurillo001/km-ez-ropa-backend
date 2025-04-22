const mongoose = require('mongoose')

const allowedPages = ['home', 'categorias', 'productos', 'detalle', 'carrito', 'checkout']

const promotionSchema = new mongoose.Schema(
  {
    // 🧾 Mensaje de la promoción
    message: {
      type: String,
      required: [true, '⚠️ El mensaje de la promoción es obligatorio'],
      trim: true,
      minlength: [3, '⚠️ El mensaje debe tener al menos 3 caracteres']
    },

    // ✅ Estado activo/inactivo
    active: {
      type: Boolean,
      default: false
    },

    // 🎨 Tema visual
    theme: {
      type: String,
      enum: ['blue', 'orange', 'green', 'red'],
      default: 'blue',
      lowercase: true,
      trim: true
    },

    // 🕓 Fechas de duración
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },

    // 🖼️ Multimedia asociada
    mediaUrl: {
      type: String,
      default: null,
      trim: true,
      validate: {
        validator: function (url) {
          return !url || /^https?:\/\/.+\.(jpg|jpeg|png|webp|mp4|gif|svg|avif)$/i.test(url)
        },
        message: '⚠️ URL de multimedia no válida'
      }
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', null],
      default: null
    },

    // 📄 Páginas donde aparece
    pages: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every(p => allowedPages.includes(p))
        },
        message: '⚠️ Una o más páginas no son válidas para promociones'
      }
    },

    // 🧭 Posición en la pantalla
    position: {
      type: String,
      enum: ['top', 'middle', 'bottom'],
      default: 'top',
      lowercase: true,
      trim: true
    },

    // ✍️ Auditoría interna
    createdBy: {
      type: String,
      trim: true,
      default: 'admin'
    },

    // 🌐 Slug opcional para URLs
    slug: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true
  }
)

// 🔍 Índices útiles para obtener campañas activas y ordenar por fecha
promotionSchema.index({ active: 1, startDate: 1, endDate: 1 })

// 🔁 Hook para crear slug automáticamente si no existe
promotionSchema.pre('save', function (next) {
  if (!this.slug && this.message) {
    this.slug = this.message
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '')
      .substring(0, 100)
  }
  next()
})

module.exports = mongoose.model('Promotion', promotionSchema)
