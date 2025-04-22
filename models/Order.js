const mongoose = require('mongoose')

// 🧾 Esquema del Pedido
const orderSchema = new mongoose.Schema(
  {
    items: [
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
      }
    ],
    total: {
      type: Number,
      required: true,
      min: [0, '⚠️ Total no puede ser negativo']
    },
    nombreCliente: {
      type: String,
      required: [true, '⚠️ Nombre del cliente requerido'],
      trim: true,
      minlength: [2, '⚠️ Mínimo 2 caracteres'],
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, '⚠️ Correo requerido'],
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
      default: '',
      trim: true,
      maxlength: [300, '⚠️ Nota demasiado larga']
    },
    estado: {
      type: String,
      enum: ['pendiente', 'en_proceso', 'enviado', 'cancelado'],
      default: 'pendiente'
    }

    // 🚚 Futuras mejoras:
    // direccionEnvio: { type: String, trim: true },
    // metodoPago: { type: String, enum: ['efectivo', 'tarjeta'], default: 'efectivo' },
    // seguimiento: { type: String, trim: true }
  },
  {
    timestamps: true // 🕒 createdAt, updatedAt
  }
)

// 🔍 Índice por estado + fecha para panel de administración
orderSchema.index({ estado: 1, createdAt: -1 })

module.exports = mongoose.model('Order', orderSchema)
