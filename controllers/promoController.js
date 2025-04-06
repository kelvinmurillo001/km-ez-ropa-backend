// controllers/promoController.js
const Promotion = require("../models/promotion");

// 📥 Obtener promoción activa (más reciente)
const getPromotion = async (req, res) => {
  try {
    const active = await Promotion.findOne({ active: true }).sort({ createdAt: -1 });
    res.json(active || null);
  } catch (error) {
    console.error("❌ Error al obtener promoción:", error);
    res.status(500).json({ message: "Error al obtener promoción" });
  }
};

// 💾 Crear o actualizar promoción
const updatePromotion = async (req, res) => {
  try {
    const {
      message,
      active,
      theme,
      startDate,
      endDate
    } = req.body;

    if (!message) {
      return res.status(400).json({ message: "El mensaje de la promoción es obligatorio" });
    }

    // 🔄 Si esta se activa, desactiva todas las demás
    if (active === true || active === 'true') {
      await Promotion.updateMany({}, { active: false });
    }

    // 🗓️ Parsear fechas si existen
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const existing = await Promotion.findOne();

    let promo;

    if (existing) {
      existing.message = message;
      existing.active = active === true || active === 'true';
      if (theme) existing.theme = theme;
      if (start) existing.startDate = start;
      if (end) existing.endDate = end;
      promo = await existing.save();
    } else {
      promo = await Promotion.create({
        message,
        active: active === true || active === 'true',
        theme: theme || 'blue',
        startDate: start || null,
        endDate: end || null
      });
    }

    res.status(200).json(promo);
  } catch (error) {
    console.error("❌ Error al guardar promoción:", error);
    res.status(500).json({ message: "Error al guardar promoción" });
  }
};

module.exports = {
  getPromotion,
  updatePromotion
};
