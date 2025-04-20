const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    // 🧾 Mensaje de la promoción (obligatorio, al menos 3 caracteres)
    message: {
      type: String,
      required: [true, "⚠️ El mensaje de la promoción es obligatorio"],
      trim: true,
      minlength: [3, "⚠️ El mensaje debe tener al menos 3 caracteres"]
    },

    // ✅ Estado activo/inactivo
    active: {
      type: Boolean,
      default: false
    },

    // 🎨 Tema visual de la promoción
    theme: {
      type: String,
      enum: ['blue', 'orange', 'green', 'red'],
      default: 'blue',
      lowercase: true,
      trim: true
    },

    // 🕓 Fecha de inicio y fin (opcional)
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },

    // 🖼️ Soporte multimedia
    mediaUrl: {
      type: String,
      default: null
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', null],
      default: null
    },

    // 📄 Páginas donde se mostrará esta promo
    pages: {
      type: [String], // Ejemplo: ['home', 'categorias', 'checkout']
      default: []
    },

    // 🧭 Posición del bloque de promoción dentro de la página
    position: {
      type: String,
      enum: ['top', 'middle', 'bottom'],
      default: 'top'
    },

    // ✍️ Usuario que creó la promo
    createdBy: {
      type: String,
      trim: true,
      default: "admin"
    }
  },
  {
    timestamps: true // 📅 createdAt y updatedAt automáticos
  }
);

module.exports = mongoose.model("Promotion", promotionSchema);
