const Promotion = require("../../models/promotion");

/**
 * 📢 Obtener promociones activas y válidas según fechas
 * @route GET /api/promotions/active
 */
const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();

    const promocionesActivas = await Promotion.find({
      active: true,
      $or: [
        {
          startDate: { $lte: now },
          endDate: { $gte: now }
        },
        {
          startDate: null,
          endDate: null
        },
        {
          startDate: { $lte: now },
          endDate: null
        },
        {
          startDate: null,
          endDate: { $gte: now }
        }
      ]
    }).sort({ createdAt: -1 });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📢 Promociones activas encontradas: ${promocionesActivas.length}`);
    }

    return res.status(200).json({
      ok: true,
      message: "✅ Promociones activas obtenidas correctamente",
      data: promocionesActivas
    });

  } catch (error) {
    console.error("❌ Error al obtener promociones activas:", error);
    return res.status(500).json({
      ok: false,
      message: "❌ Error interno del servidor al obtener promociones activas",
      error: error.message
    });
  }
};

module.exports = getActivePromotions;
