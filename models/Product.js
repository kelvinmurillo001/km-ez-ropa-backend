import mongoose from 'mongoose';
import { slugify } from '../utils/generarSlug.js'; // ✅ Integración slugify

/* 🧩 Subesquema: Variante del producto */
const variantSchema = new mongoose.Schema({
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
    match: [/^https:\/\/.+\.(jpg|jpeg|png|webp|gif|svg|avif)$/i, '⚠️ URL de imagen inválida']
  },
  cloudinaryId: {
    type: String,
    required: true,
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
}, { _id: false });

/* 📦 Esquema principal del producto */
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
    required: true,
    min: [0, '⚠️ El precio no puede ser negativo']
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minlength: 2
  },
  tallaTipo: {
    type: String,
    required: true,
    enum: ['adulto', 'joven', 'niño', 'niña', 'bebé'],
    trim: true,
    lowercase: true
  },
  featured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isDraft: { type: Boolean, default: false },

  images: {
    type: [{
      url: {
        type: String,
        required: true,
        trim: true,
        match: [/^https:\/\/.+\.(jpg|jpeg|png|webp|gif|svg|avif)$/i, '⚠️ URL inválida']
      },
      cloudinaryId: {
        type: String,
        required: true,
        trim: true
      },
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
      }
    }],
    validate: [
      {
        validator: imgs => imgs.length >= 1,
        message: '⚠️ Debes proporcionar al menos una imagen'
      },
      {
        validator: imgs => {
          const seen = new Set();
          for (const img of imgs) {
            const key = `${img.talla}-${img.color}`;
            if (seen.has(key)) return false;
            seen.add(key);
          }
          return true;
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
        validator: v => v.length <= 4,
        message: '⚠️ Máximo 4 variantes por producto'
      },
      {
        validator: v => {
          const seen = new Set();
          for (const item of v) {
            const key = `${item.talla}-${item.color}`;
            if (seen.has(key)) return false;
            seen.add(key);
          }
          return true;
        },
        message: '⚠️ Variantes duplicadas (talla + color)'
      }
    ]
  },

  stock: {
    type: Number,
    default: 0,
    min: [0, '⚠️ El stock total no puede ser negativo']
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
}, { timestamps: true });

/* 🔢 Virtual: stock total calculado */
productSchema.virtual('stockTotal').get(function () {
  return this.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
});

/* 🧠 Slug y metadescripción automáticos */
productSchema.pre('validate', async function (next) {
  this.name = this.name?.trim();
  this.category = this.category?.trim().toLowerCase();
  this.subcategory = this.subcategory?.trim().toLowerCase();

  // 🏷️ Slug único
  if (!this.slug && this.name) {
    const base = slugify(this.name);
    let slug = base;
    let i = 1;
    while (await mongoose.models.Product.exists({ slug })) {
      slug = `${base}-${i++}`;
    }
    this.slug = slug;
  }

  // 📝 Meta automática si no fue definida
  if (!this.metaDescription && this.name && this.category) {
    this.metaDescription = `Compra ${this.name} en nuestra sección de ${this.category}. Calidad garantizada.`;
  }

  next();
});

/* 🔍 Índices útiles para catálogo y panel */
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ name: 1, category: 1, subcategory: 1 });
productSchema.index({ category: 1, subcategory: 1, tallaTipo: 1 });
productSchema.index({ isActive: 1 });

/* 🚀 Exportar modelo */
const Product = mongoose.model('Product', productSchema);
export default Product;
