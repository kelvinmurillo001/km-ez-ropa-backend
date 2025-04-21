const mongoose = require("mongoose");

const allowedPages = ['home', 'categorias', 'productos', 'detalle', 'carrito', 'checkout'];

const promotionSchema = new mongoose.Schema(
  {
    // 🧾 Mensaje de la promoción
    message: {
      type: String,
      required: [true, "⚠️ El mensaje de la promoción es obligatorio"],
      trim: true,
      minlength: [3, "⚠️ El mensaje debe tener al menos 3 caracteres"]
    },

    // ✅ Estado
    active: {
      type: Boolean,
      default: false
    },

    // 🎨 Tema visual
    theme: {
      type: String,
      enum: ['blue', 'orange', 'green', 'red'],
      default: 'blue',
      lowercase: true,
      trim: true
    },

    // 🕓 Fechas
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },

    // 🖼️ Multimedia
    mediaUrl: {
      type: String,
      default: null,
      trim: true
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', null],
      default: null
    },

    // 📄 Páginas válidas
    pages: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every(p => allowedPages.includes(p));
        },
        message: '⚠️ Una o más páginas no son válidas para promociones'
      }
    },

    // 🧭 Posición visual
    position: {
      type: String,
      enum: ['top', 'middle', 'bottom'],
      default: 'top',
      lowercase: true,
      trim: true
    },

    // ✍️ Auditoría
    createdBy: {
      type: String,
      trim: true,
      default: "admin"
    }
  },
  {
    timestamps: true // createdAt y updatedAt
  }
);

module.exports = mongoose.model("Promotion", promotionSchema);
