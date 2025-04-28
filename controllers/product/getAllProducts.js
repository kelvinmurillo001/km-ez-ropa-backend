import Product from '../../models/Product.js';

/**
 * 📥 Obtener todos los productos (para catálogo o panel) con filtros + paginación
 * ✅ Filtros disponibles:
 * - nombre: búsqueda parcial (insensible a mayúsculas)
 * - categoria: exacta
 * - subcategoria: exacta
 * - precioMin / precioMax: rango
 * - paginación: página + límite
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      nombre = '',
      categoria = '',
      subcategoria = '',
      precioMin,
      precioMax,
      pagina = 1,
      limite = 12
    } = req.query;

    const filtro = {
      isActive: true, // ✅ Solo productos activos
      price: { $exists: true, $gt: 0 },
      variants: { $elemMatch: { stock: { $gt: 0 } } } // ✅ Al menos una variante con stock
    };

    // 🔍 Nombre parcial (insensible a mayúsculas)
    if (nombre.trim()) {
      filtro.name = { $regex: new RegExp(nombre.trim(), 'i') };
    }

    // 🎯 Categoría exacta
    if (categoria.trim()) {
      filtro.category = categoria.trim().toLowerCase();
    }

    // 🧩 Subcategoría exacta
    if (subcategoria.trim()) {
      filtro.subcategory = subcategoria.trim().toLowerCase();
    }

    // 💰 Precio: mínimo y/o máximo
    const min = parseFloat(precioMin);
    const max = parseFloat(precioMax);
    if (!isNaN(min) || !isNaN(max)) {
      filtro.price = {};
      if (!isNaN(min)) filtro.price.$gte = min;
      if (!isNaN(max)) filtro.price.$lte = max;
    }

    const page = Math.max(parseInt(pagina), 1);
    const limit = Math.min(Math.max(parseInt(limite), 1), 50); // máximo 50 productos por página
    const skip = (page - 1) * limit;

    // 📦 Consulta paginada
    const [productos, total] = await Promise.all([
      Product.find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filtro)
    ]);

    const totalPaginas = Math.ceil(total / limit);

    console.log(`📦 Productos encontrados: ${productos.length} | Total: ${total}`);

    return res.status(200).json({
      productos,
      total,
      pagina: page,
      totalPaginas
    });

  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    return res.status(500).json({
      message: '❌ Error interno al obtener productos',
      error: error.message
    });
  }
};

export default getAllProducts;
