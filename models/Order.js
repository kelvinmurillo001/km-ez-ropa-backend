const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        nombre: {
          type: String,
          required: true,
          trim: true
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
      }
    ],
    total: {
      type: Number,
      required: true,
      min: 0
    },
    nombreCliente: {
      type: String,
      required: true,
      trim: true
    },
    nota: {
      type: String,
      default: '',
      trim: true
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
