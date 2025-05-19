// 📁 backend/controllers/products/getProductBySlug.js
import Product from '../../models/Product.js';
import { calcularStockTotal } from '../../utils/calculateStock.js';

/**
 * 🔍 Obtener un producto por slug
 * @route   GET /api/products/slug/:slug
 * @access  Público
 */
const getProductBySlug = async (req, res) => {
  try {
    const rawSlug = String(req.params.slug || '').trim();

    // 🧼 Sanitizar y normalizar slug
    const slug = rawSlug
      .normalize('NFD')                         // Eliminar acentos
      .replace(/[\u0300-\u036f]/g, '')          // Quitar tildes
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')               // Solo letras, números y guiones
      .replace(/--+/g, '-')                     // Quitar guiones duplicados
      .replace(/^-+|-+$/g, '');                 // Quitar guiones al inicio o final

    if (!slug || slug.length < 3) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Slug inválido.'
      });
    }

    // 🔍 Buscar producto por slug
    const productoDoc = await Product.findOne({ slug }).select('-__v').lean();

    if (!productoDoc) {
      return res.status(404).json({
        ok: false,
        message: '❌ Producto no encontrado.'
      });
    }

    // 🧮 Calcular stock total
    const producto = {
      ...productoDoc,
      stockTotal: calcularStockTotal(productoDoc)
    };

    // 🐞 Log de desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 Producto encontrado por slug: ${slug}`);
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
