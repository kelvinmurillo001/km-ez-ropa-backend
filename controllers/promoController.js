const Promotion = require("../models/promotion");

/**
 * 📥 Obtener la promoción activa más reciente
 * - Devuelve la promo con `active: true`, ordenada por `createdAt`
 */
const getPromotion = async (req, res) => {
  try {
    const active = await Promotion.findOne({ active: true }).sort({ createdAt: -1 });
    return res.json(active || null); // null si no hay promoción activa
  } catch (error) {
    console.error("❌ Error al obtener promoción:", error);
    return res.status(500).json({ message: "❌ Error al obtener promoción activa" });
  }
};

/**
 * 💾 Crear o actualizar promoción
 * - Si `active` está en true, desactiva todas las demás
 * - Permite definir mensaje, fechas y tema visual
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

    // 🔎 Validación de mensaje obligatorio
    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return res.status(400).json({ message: "⚠️ El mensaje de la promoción es obligatorio y debe tener al menos 3 caracteres" });
    }

    // 🔁 Si se activa una nueva promoción, desactivar todas las existentes
    const isActive = active === true || active === 'true';
    if (isActive) {
      await Promotion.updateMany({}, { active: false });
    }

    // 🗓️ Validar y convertir fechas
    const parsedStart = startDate ? new Date(startDate) : null;
    const parsedEnd = endDate ? new Date(endDate) : null;

    if (parsedStart && isNaN(parsedStart)) {
      return res.status(400).json({ message: "⚠️ Fecha de inicio inválida" });
    }

    if (parsedEnd && isNaN(parsedEnd)) {
      return res.status(400).json({ message: "⚠️ Fecha de fin inválida" });
    }

    let promo;

    // ⚙️ Si ya existe una promoción, actualizamos
    const existing = await Promotion.findOne();
    if (existing) {
      existing.message = message.trim();
      existing.active = isActive;
      existing.theme = theme;
      existing.startDate = parsedStart;
      existing.endDate = parsedEnd;
      promo = await existing.save();
    } else {
      // ➕ Crear una nueva promoción
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
