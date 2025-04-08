const Promotion = require("../models/promotion");

/**
 * 📥 Obtener la promoción activa más reciente
 * - Devuelve la promo con `active: true`, ordenada por `createdAt`
 */
const getPromotion = async (req, res) => {
  try {
    const active = await Promotion.findOne({ active: true }).sort({ createdAt: -1 });
    res.json(active || null); // Si no hay promoción activa, devolver null
  } catch (error) {
    console.error("❌ Error al obtener promoción:", error);
    res.status(500).json({ message: "Error al obtener promoción" });
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
      active,
      theme,
      startDate,
      endDate
    } = req.body;

    // ✅ Validación obligatoria
    if (!message) {
      return res.status(400).json({ message: "El mensaje de la promoción es obligatorio" });
    }

    // 🔁 Si se activa una nueva, desactivar todas las existentes
    if (active === true || active === 'true') {
      await Promotion.updateMany({}, { active: false });
    }

    // 🗓️ Conversión segura de fechas
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // Verificar si ya existe una promoción registrada
    const existing = await Promotion.findOne();

    let promo;

    if (existing) {
      // ✏️ Actualizar campos existentes
      existing.message = message;
      existing.active = active === true || active === 'true';
      if (theme) existing.theme = theme;
      if (start) existing.startDate = start;
      if (end) existing.endDate = end;
      promo = await existing.save();
    } else {
      // ➕ Crear una nueva promoción
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
