// 📁 backend/controllers/promotions/getActivePromotions.js
import Promotion from '../../models/promotion.js';

/**
 * 📢 Devuelve promociones activas y vigentes según la fecha actual.
 * @route   GET /api/promotions/active
 * @access  Público
 */
const getActivePromotions = async (_req, res) => {
  try {
    const now = new Date();

    const promociones = await Promotion.find({
      active: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } }
      ]
    })
      .select('-__v')
      .sort({ createdAt: -1 })
      .lean();

    const data = promociones.map(p => ({
      id: p._id,
      title: p.title || '',
      message: p.message || '',
      active: p.active,
      startDate: p.startDate?.toISOString() || null,
      endDate: p.endDate?.toISOString() || null,
      duration: p.startDate && p.endDate
        ? Math.ceil((p.endDate - p.startDate) / (1000 * 60 * 60 * 24))
        : null,
      createdAt: p.createdAt?.toISOString() || null,
      theme: p.theme || null,
      mediaUrl: p.mediaUrl || null,
      mediaType: p.mediaType || null,
      pages: Array.isArray(p.pages) ? p.pages : [],
      position: p.position || null
    }));

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📢 Promociones activas encontradas: ${data.length}`);
    }

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error('❌ Error al obtener promociones activas:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener promociones activas.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default getActivePromotions;
