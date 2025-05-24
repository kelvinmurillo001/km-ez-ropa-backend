import Product from '../../models/Product.js';
import { calcularStockTotal } from '../../utils/calculateStock.js';
import logger from '../../utils/logger.js';

/**
 * 📥 Obtener productos con filtros y paginación
 * @route GET /api/products
 * @access Público
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      nombre = '',
      categoria = '',
      subcategoria = '',
      precioMin,
      precioMax,
      featured,
      pagina = 1,
      limite = 12,
      conStock = 'false'
    } = req.query;

    const filtro = { isActive: true };

    if (nombre.trim().length > 1) {
      filtro.name = { $regex: new RegExp(nombre.trim(), 'i') };
    }

    if (categoria.trim()) {
      filtro.category = categoria.trim().toLowerCase();
    }

    if (subcategoria.trim()) {
      filtro.subcategory = subcategoria.trim().toLowerCase();
    }

    if (featured === 'true') {
      filtro.featured = true;
    }

    const min = parseFloat(precioMin);
    const max = parseFloat(precioMax);
    if (!isNaN(min) || !isNaN(max)) {
      filtro.price = {};
      if (!isNaN(min)) filtro.price.$gte = min;
      if (!isNaN(max)) filtro.price.$lte = max;
    }

    const page = Math.max(parseInt(pagina, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(limite, 10) || 12, 1), 100);
    const skip = Math.max((page - 1) * limit, 0);

    const [productosRaw, totalBruto] = await Promise.all([
      Product.find(filtro).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Product.countDocuments(filtro)
    ]);

    const productos = productosRaw.map(prod => ({
      ...prod,
      stockTotal: calcularStockTotal(prod)
    }));

    const productosFinales =
      conStock === 'true' ? productos.filter(p => p.stockTotal > 0) : productos;

    const totalVisibles = productosFinales.length;
    const totalPaginas = Math.ceil(totalBruto / limit);

    if (process.env.NODE_ENV !== 'production') {
      logger.debug(
        `📦 Productos listados: ${totalVisibles}/${totalBruto} | Página ${page}`
      );
    }

    return res.status(200).json({
      ok: true,
      data: {
        productos: productosFinales,
        total: totalVisibles,
        pagina: page,
        totalPaginas,
        totalBruto
      }
    });
  } catch (err) {
    logger.error('❌ Error al obtener productos:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener productos.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default getAllProducts;
