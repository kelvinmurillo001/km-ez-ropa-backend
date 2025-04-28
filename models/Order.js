// 📁 backend/models/Order.js
import mongoose from 'mongoose'

// 📦 Subesquema de ítems del pedido
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, '⚠️ ID de producto requerido']
    },
    name: {
      type: String,
      required: [true, '⚠️ Nombre del producto requerido'],
      trim: true,
      minlength: [2, '⚠️ Mínimo 2 caracteres']
    },
    talla: {
      type: String,
      trim: true,
      default: 'Única'
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, '⚠️ Cantidad mínima es 1']
    },
    precio: {
      type: Number,
      required: true,
      min: [0, '⚠️ El precio no puede ser negativo']
    }
  },
  { _id: false }
)

// 🧾 Esquema principal del Pedido
const orderSchema = new mongoose.Schema(
  {
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: '⚠️ El pedido debe contener al menos un producto'
      }
    },
    total: {
      type: Number,
      required: true,
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
      minlength: [7, '⚠️ Teléfono demasiado corto'],
      maxlength: [20, '⚠️ Teléfono demasiado largo']
    },
    nota: {
      type: String,
      trim: true,
      maxlength: [300, '⚠️ Nota demasiado larga'],
      default: ''
    },
    estado: {
      type: String,
      enum: ['pendiente', 'en_proceso', 'enviado', 'cancelado'],
      default: 'pendiente'
    }

    // 🚀 Futuro:
    // direccionEnvio: { type: String, trim: true },
    // metodoPago: { type: String, enum: ['efectivo', 'tarjeta'], default: 'efectivo' },
    // seguimiento: { type: String, trim: true }
  },
  {
    timestamps: true // 🕒 createdAt y updatedAt automáticos
  }
)

// 🔍 Índices útiles para optimizar búsquedas por estado y fecha
orderSchema.index({ estado: 1, createdAt: -1 })

// 🚀 Exportar el modelo
const Order = mongoose.model('Order', orderSchema)
export default Order
