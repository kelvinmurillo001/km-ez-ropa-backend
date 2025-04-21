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
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } }
      ]
    }).sort({ createdAt: -1 });

    return res.status(200).json(promocionesActivas);
  } catch (error) {
    console.error("❌ Error al obtener promociones activas:", error.message);
    return res.status(500).json({
      message: "❌ Error del servidor al obtener promociones activas"
    });
  }
};

module.exports = getActivePromotions;
