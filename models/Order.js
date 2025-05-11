// 📁 backend/models/Order.js
import mongoose from 'mongoose'

// 📦 Subesquema de ítems del pedido
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, '⚠️ ID de producto requerido']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
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
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false })

// 🧾 Subesquema de factura
const facturaSchema = new mongoose.Schema({
  razonSocial: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  ruc: {
    type: String,
    trim: true,
    match: [/^[0-9]{8,20}$/, '⚠️ RUC inválido']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '⚠️ Email de facturación inválido']
  }
}, { _id: false })

// 🧾 Esquema principal del pedido
const orderSchema = new mongoose.Schema({
  items: {
    type: [orderItemSchema],
    validate: {
      validator: arr => Array.isArray(arr) && arr.length > 0,
      message: '⚠️ El pedido debe contener al menos un producto'
    }
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  nombreCliente: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '⚠️ Email inválido']
  },
  telefono: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9+\- ()]{7,20}$/, '⚠️ Teléfono inválido']
  },
  direccion: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 300
  },
  nota: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'enviado', 'cancelado', 'pagado'],
    default: 'pendiente'
  },
  metodoPago: {
    type: String,
    enum: ['efectivo', 'tarjeta', 'paypal', 'transferencia'],
    default: 'efectivo'
  },
  seguimiento: {
    type: String,
    trim: true,
    default: ''
  },
  codigoSeguimiento: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
    match: [/^KMZ-[A-Z0-9]{8}$/, '⚠️ Código de seguimiento inválido']
  },
  factura: {
    type: facturaSchema,
    default: () => ({})
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = ret._id.toString()
      delete ret._id
      return ret
    }
  },
  toObject: {
    virtuals: true,
    versionKey: false
  }
})

// 🔁 Pre-save: Generar código de seguimiento único
orderSchema.pre('save', async function (next) {
  if (this.codigoSeguimiento) return next()

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return 'KMZ-' + Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]).join('')
  }

  let code, exists, attempts = 0
  do {
    code = generateCode()
    exists = await mongoose.models.Order.exists({ codigoSeguimiento: code })
    attempts++
  } while (exists && attempts < 10)

  if (exists) return next(new Error('⚠️ No se pudo generar un código único. Intenta de nuevo.'))
  this.codigoSeguimiento = code
  next()
})

// 📦 Índices útiles
orderSchema.index({ estado: 1, createdAt: -1 })

// 🚀 Exportar modelo
const Order = mongoose.model('Order', orderSchema)
export default Order
