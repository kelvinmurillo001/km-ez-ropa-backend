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
    required: [true, '⚠️ Nombre del producto requerido'],
    trim: true,
    minlength: [2, '⚠️ Mínimo 2 caracteres'],
    maxlength: [100, '⚠️ Máximo 100 caracteres']
  },
  talla: {
    type: String,
    required: [true, '⚠️ Talla requerida'],
    trim: true,
    lowercase: true
  },
  color: {
    type: String,
    required: [true, '⚠️ Color requerido'],
    trim: true,
    lowercase: true
  },
  cantidad: {
    type: Number,
    required: [true, '⚠️ Cantidad requerida'],
    min: [1, '⚠️ La cantidad mínima es 1']
  },
  precio: {
    type: Number,
    required: [true, '⚠️ Precio requerido'],
    min: [0, '⚠️ El precio no puede ser negativo']
  }
}, { _id: false })

// 🧾 Subesquema de factura
const facturaSchema = new mongoose.Schema({
  razonSocial: {
    type: String,
    trim: true,
    minlength: [2, '⚠️ Razón social muy corta'],
    maxlength: [100, '⚠️ Razón social demasiado larga']
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
    required: [true, '⚠️ Total requerido'],
    min: [0, '⚠️ El total no puede ser negativo']
  },
  nombreCliente: {
    type: String,
    required: [true, '⚠️ Nombre del cliente requerido'],
    trim: true,
    minlength: [2, '⚠️ Mínimo 2 caracteres'],
    maxlength: [100, '⚠️ Máximo 100 caracteres']
  },
  email: {
    type: String,
    required: [true, '⚠️ Correo electrónico requerido'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, '⚠️ Email inválido']
  },
  telefono: {
    type: String,
    required: [true, '⚠️ Teléfono requerido'],
    trim: true,
    match: [/^[0-9\-+ ]{7,20}$/, '⚠️ Teléfono inválido']
  },
  direccion: {
    type: String,
    required: [true, '⚠️ Dirección requerida'],
    trim: true,
    minlength: [5, '⚠️ Dirección muy corta'],
    maxlength: [300, '⚠️ Dirección demasiado larga']
  },
  nota: {
    type: String,
    trim: true,
    maxlength: [300, '⚠️ Nota demasiado larga'],
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
  toObject: { virtuals: true, versionKey: false }
})

// 🔁 Hook: Generar código de seguimiento único antes de guardar
orderSchema.pre('save', async function (next) {
  if (this.codigoSeguimiento) return next()
  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return 'KMZ-' + Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)]).join('')
  }
  let code = generateCode()
  while (await mongoose.models.Order.exists({ codigoSeguimiento: code })) {
    code = generateCode()
  }
  this.codigoSeguimiento = code
  return next()
})

// 🔍 Índice compuesto: estado + fecha
orderSchema.index({ estado: 1, createdAt: -1 })

// 🚀 Exportar modelo
const Order = mongoose.model('Order', orderSchema)
export default Order
