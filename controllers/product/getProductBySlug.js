import Product from '../../models/Product.js';
import { calcularStockTotal } from '../../utils/calculateStock.js';
import logger from '../../utils/logger.js';

/**
 * 🔍 Obtener un producto por su slug
 * @route GET /api/products/slug/:slug
 * @access Público
 */
const getProductBySlug = async (req, res) => {
  try {
    const rawSlug = req.params.slug?.trim();

    // 🧼 Sanitizar y normalizar slug
    const slug = rawSlug
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug || slug.length < 3) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Slug inválido.'
      });
    }

    const productoDoc = await Product.findOne({ slug }).select('-__v').lean();

    if (!productoDoc) {
      return res.status(404).json({
        ok: false,
        message: '❌ Producto no encontrado.'
      });
    }

    const producto = {
      ...productoDoc,
      stockTotal: calcularStockTotal(productoDoc)
    };

    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`🔍 Producto encontrado por slug: "${slug}" -> ID: ${producto._id}`);
    }

    return res.status(200).json({
      ok: true,
      data: producto
    });
  } catch (err) {
    logger.error('❌ Error en getProductBySlug:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener producto por slug.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default getProductBySlug;
