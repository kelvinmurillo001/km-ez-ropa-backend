const Promotion = require("../../models/promotion");

/**
 * 📢 Obtener promociones activas y dentro de su rango de fecha
 * @route GET /api/promotions/active
 */
const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();

    const promocionesActivas = await Promotion.find({
      active: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ startDate: 1 });

    res.status(200).json(promocionesActivas);
  } catch (error) {
    console.error("❌ Error al obtener promociones activas:", error.message);
    res.status(500).json({ message: "❌ Error del servidor al obtener promociones activas" });
  }
};

module.exports = getActivePromotions;
