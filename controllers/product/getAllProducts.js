// 📁 backend/controllers/products/getAllProducts.js
import Product from '../../models/Product.js';
import { calcularStockTotal } from '../../utils/calculateStock.js';

/**
 * 📥 Obtener productos con filtros avanzados y stock real
 * @route   GET /api/products
 * @access  Público
 */
const getAllProducts = async (req, res) => {
  try {
    // 🔍 Extraer filtros desde query
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

    // 🔎 Nombre (búsqueda parcial)
    if (typeof nombre === 'string' && nombre.trim().length > 1) {
      filtro.name = { $regex: new RegExp(nombre.trim(), 'i') };
    }

    // 🧭 Categoría / subcategoría
    if (typeof categoria === 'string' && categoria.trim()) {
      filtro.category = categoria.trim().toLowerCase();
    }
    if (typeof subcategoria === 'string' && subcategoria.trim()) {
      filtro.subcategory = subcategoria.trim().toLowerCase();
    }

    // 🌟 Destacados
    if (featured === 'true') {
      filtro.featured = true;
    }

    // 💲 Rango de precio
    const min = parseFloat(precioMin);
    const max = parseFloat(precioMax);
    if (!isNaN(min) || !isNaN(max)) {
      filtro.price = {};
      if (!isNaN(min)) filtro.price.$gte = min;
      if (!isNaN(max)) filtro.price.$lte = max;
    }

    // 📄 Paginación con límites seguros
    const page = Math.max(parseInt(pagina, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(limite, 10) || 12, 1), 100);
    const skip = (page - 1) * limit;

    // 🧾 Consulta base
    const [productosRaw, totalBruto] = await Promise.all([
      Product.find(filtro).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Product.countDocuments(filtro)
    ]);

    // 🔢 Calcular stock total por producto
    const productos = productosRaw.map(prod => ({
      ...prod,
      stockTotal: calcularStockTotal(prod)
    }));

    // ✅ Filtrar por stock positivo si se requiere
    const productosFinales = conStock === 'true'
      ? productos.filter(p => p.stockTotal > 0)
      : productos;

    const totalVisibles = productosFinales.length;
    const totalPaginas = Math.ceil(totalBruto / limit);

    // 🐞 Log opcional
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📦 Productos listados: ${totalVisibles}/${totalBruto} | Página ${page}`);
    }

    // 📤 Respuesta final
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
      message: '❌ Error interno al obtener productos.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default getAllProducts;
