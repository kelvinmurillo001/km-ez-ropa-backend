const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        nombre: {
          type: String,
          required: [true, '⚠️ El nombre del producto es obligatorio'],
          trim: true,
          minlength: [2, '⚠️ El nombre debe tener al menos 2 caracteres']
        },
        cantidad: {
          type: Number,
          required: [true, '⚠️ La cantidad es obligatoria'],
          min: [1, '⚠️ La cantidad debe ser al menos 1']
        },
        precio: {
          type: Number,
          required: [true, '⚠️ El precio es obligatorio'],
          min: [0, '⚠️ El precio no puede ser negativo']
        }
      }
    ],
    total: {
      type: Number,
      required: [true, '⚠️ El total es obligatorio'],
      min: [0, '⚠️ El total no puede ser negativo']
    },
    nombreCliente: {
      type: String,
      required: [true, '⚠️ El nombre del cliente es obligatorio'],
      trim: true,
      minlength: [2, '⚠️ El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, '⚠️ El nombre no debe exceder 100 caracteres']
    },
    nota: {
      type: String,
      default: '',
      trim: true,
      maxlength: [300, '⚠️ La nota no debe superar 300 caracteres']
    },
    estado: {
      type: String,
      enum: ['pendiente', 'en_proceso', 'enviado', 'cancelado'],
      default: 'pendiente'
    }
  },
  {
    timestamps: true // Añade createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model('Order', orderSchema);
