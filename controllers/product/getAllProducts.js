// 📁 backend/controllers/product/getAllProducts.js
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
      conStock
    } = req.query;

    const filtro = { isActive: true };

    // 🔍 Filtros de texto
    if (nombre.trim()) {
      filtro.name = { $regex: new RegExp(nombre.trim(), 'i') };
    }
    if (categoria.trim()) {
      filtro.category = categoria.trim().toLowerCase();
    }
    if (subcategoria.trim()) {
      filtro.subcategory = subcategoria.trim().toLowerCase();
    }

    // 🔍 Filtro por destacados
    if (featured === 'true') {
      filtro.featured = true;
    }

    // 💲 Filtro por rango de precios
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

    // 🚀 Consulta de productos y conteo total
    const [productosRaw, totalBruto] = await Promise.all([
      Product.find(filtro).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Product.countDocuments(filtro)
    ]);

    // 📦 Cálculo de stock y filtrado adicional
    const productos = productosRaw.map(p => ({
      ...p,
      stockTotal: calcularStockTotal(p)
    }));

    const productosFiltrados = conStock === 'true'
      ? productos.filter(p => p.stockTotal > 0)
      : productos;

    const totalVisibles = productosFiltrados.length;
    const totalPaginas = Math.ceil(totalBruto / limit);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📦 Productos devueltos: ${totalVisibles} de ${totalBruto} encontrados`);
    }

    return res.status(200).json({
      ok: true,
      data: {
        productos: productosFiltrados,
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
