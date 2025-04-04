// models/promotion.js

const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    enum: ['blue', 'orange', 'green', 'red'],
    default: 'blue'
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: String,
    default: "admin"
  }
}, {
  timestamps: true // createdAt y updatedAt automáticamente
});

module.exports = mongoose.model("Promotion", promotionSchema);
