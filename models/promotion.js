// 📁 backend/models/promotion.js
import mongoose from 'mongoose';

const allowedPages = ['home', 'categorias', 'productos', 'detalle', 'carrito', 'checkout'];

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
      trim: true,
      default: null,
      validate: {
        validator: (url) =>
          !url || /^https?:\/\/.+\.(jpg|jpeg|png|webp|mp4|gif|svg|avif)$/i.test(url),
        message: '⚠️ URL de imagen/video inválida. Debe terminar en una extensión válida.'
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
        validator: function (arr) {
          if (!Array.isArray(arr)) return false;
          return arr.every((p) => allowedPages.includes(p));
        },
        message: '⚠️ Una o más páginas asignadas no son válidas.'
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
    timestamps: true
  }
);

// 📌 Índices útiles
promotionSchema.index({ active: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ slug: 1 }); // Cambiar a `unique: true` si lo usarás en URLs

// 🧼 Pre-save: genera slug si no existe
promotionSchema.pre('save', function (next) {
  if (!this.slug && this.message) {
    const base = this.message
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // elimina tildes
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '') // elimina caracteres especiales
      .replace(/\s+/g, '-')         // espacios a guiones
      .replace(/--+/g, '-')         // quita múltiples guiones
      .replace(/^-+|-+$/g, '');     // limpia extremos

    this.slug = base.substring(0, 100);
  }
  next();
});

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
