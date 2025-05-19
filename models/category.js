// 📁 backend/models/category.js
import mongoose from 'mongoose';

// 📦 Esquema de Categoría con subcategorías
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '⚠️ El nombre de la categoría es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [2, '⚠️ El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, '⚠️ El nombre no debe superar los 50 caracteres'],
    match: [/^[a-zA-Z0-9áéíóúñ\s-]+$/, '⚠️ El nombre solo puede contener letras, números y espacios']
  },

  subcategories: {
    type: [String],
    default: [],
    validate: {
      validator: arr =>
        Array.isArray(arr) &&
        arr.every(sub => typeof sub === 'string' && sub.trim().length >= 2),
      message: '⚠️ Cada subcategoría debe tener al menos 2 caracteres'
    },
    set: arr => Array.isArray(arr)
      ? [...new Set(
          arr.map(sub =>
            sub.trim()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^\w\s-]/g, '')
          )
        )]
      : []
  },

  icon: {
    type: String,
    trim: true,
    default: '',
    match: [/^https?:\/\/.+\.(svg|png|jpg|jpeg|webp)$/i, '⚠️ El icono debe ser una URL válida de imagen']
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    versionKey: false
  }
});

// 🆕 Virtual: slug autogenerado para URLs amigables
categorySchema.virtual('slug').get(function () {
  return this.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .toLowerCase();
});

// 🔍 Índice con collation español para evitar duplicados por tildes/mayúsculas
categorySchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: 'es', strength: 2 }
  }
);

// ✅ Log automático en guardado
categorySchema.post('save', function (doc, next) {
  console.log(`✅ Categoría guardada: ${doc.name} (${doc._id})`);
  next();
});

// ❌ Log de errores duplicados
categorySchema.post('error', function (err, _doc, next) {
  if (err.name === 'MongoServerError' && err.code === 11000) {
    console.error('❌ Error: El nombre de categoría ya existe.');
  } else {
    console.error('❌ Error al guardar categoría:', err);
  }
  next(err);
});

// 🚀 Exportar modelo
const Category = mongoose.model('Category', categorySchema);
export default Category;
