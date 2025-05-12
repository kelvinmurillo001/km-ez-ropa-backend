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

    // 🧼 Normalizar y sanitizar slug
    const slug = rawSlug
      .normalize('NFD')                     // Eliminar tildes
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')           // Solo letras, números, guiones
      .replace(/--+/g, '-')                 // Quitar guiones duplicados
      .replace(/^-+|-+$/g, '');             // Quitar guiones al inicio o fin

    if (!slug || slug.length < 3) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Slug inválido.'
      });
    }

    // 🔍 Buscar producto
    const productoDoc = await Product.findOne({ slug })
      .select('-__v')
      .lean();

    if (!productoDoc) {
      return res.status(404).json({
        ok: false,
        message: '❌ Producto no encontrado.'
      });
    }

    // 📦 Agregar stock calculado
    const producto = {
      ...productoDoc,
      stockTotal: calcularStockTotal(productoDoc)
    };

    // 🧾 Log interno en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 Producto cargado por slug: ${slug}`);
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
