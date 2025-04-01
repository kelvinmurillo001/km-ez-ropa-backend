// controllers/promoController.js

const Promotion = require("../models/promotion");

// 📥 Get active promotion
const getPromotion = async (req, res) => {
  try {
    const active = await Promotion.findOne({ active: true });
    res.json(active || null);
  } catch (error) {
    console.error("❌ Error getting promotion:", error);
    res.status(500).json({ message: "Error getting promotion" });
  }
};

// 💾 Create or update promotion
const updatePromotion = async (req, res) => {
  try {
    const { message, active } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Promotion message is required" });
    }

    if (active) {
      await Promotion.updateMany({}, { active: false });
    }

    const existing = await Promotion.findOne();

    let promo;

    if (existing) {
      existing.message = message;
      existing.active = active;
      promo = await existing.save();
    } else {
      promo = await Promotion.create({ message, active });
    }

    res.status(200).json(promo);
  } catch (error) {
    console.error("❌ Error saving promotion:", error);
    res.status(500).json({ message: "Error saving promotion" });
  }
};

module.exports = {
  getPromotion,
  updatePromotion
};
