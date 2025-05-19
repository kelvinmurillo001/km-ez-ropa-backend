// 📁 backend/models/promotion.js
import mongoose from 'mongoose';

const allowedPages = ['home', 'categorias', 'productos', 'detalle', 'carrito', 'checkout'];

const promotionSchema = new mongoose.Schema({
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
      validator: url =>
        !url || /^https?:\/\/.+\.(jpg|jpeg|png|webp|mp4|gif|svg|avif)$/i.test(url),
      message: '⚠️ URL de imagen o video inválida.'
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
      validator: arr =>
        Array.isArray(arr) &&
        arr.every(page => allowedPages.includes(page)),
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
}, {
  timestamps: true
});

// 🧠 Índices útiles para búsqueda y control
promotionSchema.index({ active: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ slug: 1 }); // usar `unique: true` si se usa en URLs

// 🔧 Slug automático basado en mensaje
promotionSchema.pre('save', function (next) {
  if (!this.slug && this.message) {
    const base = this.message
      .toLowerCase()
      .trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');

    this.slug = base.substring(0, 100);
  }
  next();
});

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
