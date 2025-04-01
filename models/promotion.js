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
  createdBy: {
    type: String,
    default: "admin"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Promotion", promotionSchema);
