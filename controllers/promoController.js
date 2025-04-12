const Promotion = require("../models/promotion");

/**
 * 📥 Obtener la promoción activa más reciente
 */
const getPromotion = async (req, res) => {
  try {
    const active = await Promotion.findOne({ active: true }).sort({ createdAt: -1 });
    return res.json(active || null); // Devuelve null si no hay una activa
  } catch (error) {
    console.error("❌ Error al obtener promoción:", error);
    return res.status(500).json({ message: "❌ Error al obtener promoción activa" });
  }
};

/**
 * 💾 Crear o actualizar promoción
 */
const updatePromotion = async (req, res) => {
  try {
    const {
      message,
      active = false,
      theme = 'blue',
      startDate,
      endDate
    } = req.body;

    // 🛡️ Validación básica
    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return res.status(400).json({
        message: "⚠️ El mensaje de la promoción es obligatorio y debe tener al menos 3 caracteres"
      });
    }

    const isActive = active === true || active === 'true';

    // 🚫 Desactivar otras promociones si se activa una nueva
    if (isActive) {
      await Promotion.updateMany({}, { active: false });
    }

    const parsedStart = startDate ? new Date(startDate) : null;
    const parsedEnd = endDate ? new Date(endDate) : null;

    if (parsedStart && isNaN(parsedStart)) {
      return res.status(400).json({ message: "⚠️ Fecha de inicio inválida" });
    }

    if (parsedEnd && isNaN(parsedEnd)) {
      return res.status(400).json({ message: "⚠️ Fecha de fin inválida" });
    }

    let promo;
    const existing = await Promotion.findOne();

    if (existing) {
      // 🔄 Actualizar existente
      existing.message = message.trim();
      existing.active = isActive;
      existing.theme = theme;
      existing.startDate = parsedStart;
      existing.endDate = parsedEnd;
      promo = await existing.save();
    } else {
      // ➕ Crear nueva
      promo = await Promotion.create({
        message: message.trim(),
        active: isActive,
        theme,
        startDate: parsedStart,
        endDate: parsedEnd
      });
    }

    return res.status(200).json({
      message: '✅ Promoción guardada exitosamente',
      data: promo
    });

  } catch (error) {
    console.error("❌ Error al guardar promoción:", error);
    return res.status(500).json({ message: "❌ Error al guardar promoción" });
  }
};

module.exports = {
  getPromotion,
  updatePromotion
};
