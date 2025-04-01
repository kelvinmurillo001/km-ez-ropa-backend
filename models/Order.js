const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      nombre: String,
      cantidad: Number,
      precio: Number
    }
  ],
  total: {
    type: Number,
    required: true
  },
  nombreCliente: {
    type: String,
    required: true
  },
  nota: {
    type: String,
    default: ''
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'enviado', 'cancelado'],
    default: 'pendiente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
