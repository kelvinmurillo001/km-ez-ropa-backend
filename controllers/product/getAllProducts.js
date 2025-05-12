import Product from '../../models/Product.js';
import { calcularStockTotal } from '../../utils/calculateStock.js';

/**
 * 📥 Obtener productos con filtros avanzados y stock real
 * @route   GET /api/products
 * @access  Público
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

    // 🔍 Filtro por nombre
    if (nombre.trim()) {
      filtro.name = { $regex: new RegExp(nombre.trim(), 'i') };
    }

    // 🔍 Filtro por categoría y subcategoría
    if (categoria.trim()) {
      filtro.category = categoria.trim().toLowerCase();
    }
    if (subcategoria.trim()) {
      filtro.subcategory = subcategoria.trim().toLowerCase();
    }

    // ⭐ Productos destacados
    if (featured === 'true') {
      filtro.featured = true;
    }

    // 💵 Filtro por rango de precio
    const min = parseFloat(precioMin);
    const max = parseFloat(precioMax);
    if (!isNaN(min) || !isNaN(max)) {
      filtro.price = {};
      if (!isNaN(min)) filtro.price.$gte = min;
      if (!isNaN(max)) filtro.price.$lte = max;
    }

    // 📄 Paginación segura
    const page = Math.max(parseInt(pagina, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(limite, 10) || 12, 1), 50);
    const skip = (page - 1) * limit;

    // 🧾 Obtener productos y conteo total
    const [productosRaw, totalBruto] = await Promise.all([
      Product.find(filtro).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Product.countDocuments(filtro)
    ]);

    // 🧮 Calcular stock solo si se necesita
    const productos = productosRaw.map((prod) => ({
      ...prod,
      stockTotal: calcularStockTotal(prod)
    }));

    // ✅ Filtro adicional: solo con stock
    const productosFinales =
      conStock === 'true' ? productos.filter((p) => p.stockTotal > 0) : productos;

    const totalVisibles = productosFinales.length;
    const totalPaginas = Math.ceil(totalBruto / limit);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📦 Productos: ${totalVisibles}/${totalBruto} | Página ${page}`);
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
    console.error('❌ Error al obtener productos:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener productos',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default getAllProducts;
