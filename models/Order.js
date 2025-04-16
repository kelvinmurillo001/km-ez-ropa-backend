const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        name: {
          type: String,
          required: true,
          trim: true,
          minlength: 2
        },
        talla: {
          type: String,
          default: "Única"
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
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    nota: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300
    },
    estado: {
      type: String,
      enum: ['pendiente', 'en_proceso', 'enviado', 'cancelado'],
      default: 'pendiente'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
