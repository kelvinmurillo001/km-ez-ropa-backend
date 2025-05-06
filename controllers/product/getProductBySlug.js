// 📁 backend/controllers/product/getProductBySlug.js
import Product from '../../models/Product.js';
import { calcularStockTotal } from '../../utils/calculateStock.js';

/**
 * 🔍 Obtener un producto por slug
 * @route   GET /api/products/slug/:slug
 * @access  Público
 */
const getProductBySlug = async (req, res) => {
  try {
    // Sanitizar y normalizar slug
    let slugRaw = String(req.params.slug || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .trim().toLowerCase();

    // Validar slug (mínimo 3 caracteres, sin caracteres inválidos)
    if (!/^[a-z0-9-]{3,}$/.test(slugRaw)) {
      return res.status(400).json({ ok: false, message: '⚠️ Slug inválido.' });
    }

    const productoDoc = await Product.findOne({ slug: slugRaw })
      .select('-__v')
      .lean();

    if (!productoDoc) {
      return res.status(404).json({ ok: false, message: '❌ Producto no encontrado.' });
    }

    // Calcular stock total
    const stockTotal = calcularStockTotal(productoDoc);
    const producto = { ...productoDoc, stockTotal };

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 Producto obtenido por slug: ${slugRaw}`);
    }

    return res.status(200).json({ ok: true, data: producto });
  } catch (err) {
    console.error('❌ Error interno al obtener producto por slug:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener producto por slug.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default getProductBySlug;
