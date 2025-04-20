const Promotion = require("../models/promotion");

/**
 * 📥 Obtener promociones activas y vigentes (actuales)
 */
const getPromotion = async (req, res) => {
  try {
    const now = new Date();

    const activePromos = await Promotion.find({
      active: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } }
      ]
    }).sort({ createdAt: -1 });

    return res.json(activePromos);
  } catch (error) {
    console.error("❌ Error al obtener promociones:", error);
    return res.status(500).json({ message: "❌ Error al obtener promociones activas" });
  }
};

/**
 * 💾 Crear o actualizar promoción (una a la vez)
 */
const updatePromotion = async (req, res) => {
  try {
    const {
      message,
      active = false,
      theme = 'blue',
      startDate,
      endDate,
      mediaUrl = null,
      mediaType = null,
      pages = [],
      position = 'top'
    } = req.body;

    // 🛡️ Validaciones básicas
    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return res.status(400).json({
        message: "⚠️ El mensaje de la promoción es obligatorio y debe tener al menos 3 caracteres"
      });
    }

    if (mediaType && !['image', 'video'].includes(mediaType)) {
      return res.status(400).json({ message: "⚠️ mediaType debe ser 'image' o 'video'" });
    }

    const allowedPages = ['home', 'categorias', 'productos', 'checkout', 'panel'];
    if (!Array.isArray(pages) || pages.some(p => !allowedPages.includes(p))) {
      return res.status(400).json({ message: "⚠️ Página inválida en pages[]" });
    }

    const isActive = active === true || active === 'true';
    const parsedStart = startDate ? new Date(startDate) : null;
    const parsedEnd = endDate ? new Date(endDate) : null;

    if (parsedStart && isNaN(parsedStart)) {
      return res.status(400).json({ message: "⚠️ Fecha de inicio inválida" });
    }

    if (parsedEnd && isNaN(parsedEnd)) {
      return res.status(400).json({ message: "⚠️ Fecha de fin inválida" });
    }

    // ✅ Guardar nueva promoción
    const promo = new Promotion({
      message: message.trim(),
      active: isActive,
      theme,
      startDate: parsedStart,
      endDate: parsedEnd,
      mediaUrl,
      mediaType,
      pages,
      position,
      createdBy: req.user?.username || "admin"
    });

    await promo.save();

    return res.status(201).json({
      message: '✅ Promoción creada correctamente',
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
