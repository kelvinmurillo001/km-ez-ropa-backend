const Product = require('../../models/Product');

/**
 * 📥 Obtener todos los productos visibles (público o para panel admin)
 * ✅ Soporta filtros:
 * - nombre: búsqueda parcial por nombre (case-insensitive)
 * - categoria: categoría exacta
 * - subcategoria: subcategoría exacta
 * - precioMin / precioMax: rango de precio
 *
 * @route GET /api/products?nombre=camisa&categoria=hombres&subcategoria=basicas&precioMin=10&precioMax=50
 */
const getAllProducts = async (req, res) => {
  try {
    const { nombre, categoria, subcategoria, precioMin, precioMax } = req.query;

    // 🎯 Filtro base
    const filtro = {
      name: { $exists: true, $ne: "" },
      price: { $exists: true, $gt: 0 }
    };

    // 🔍 Filtro por nombre (búsqueda parcial e insensible a mayúsculas)
    if (nombre && nombre.trim()) {
      filtro.name = { $regex: new RegExp(nombre.trim(), "i") };
    }

    // 🎯 Filtro por categoría exacta
    if (categoria && categoria.trim()) {
      filtro.category = categoria.trim().toLowerCase();
    }

    // 🧩 Filtro por subcategoría exacta
    if (subcategoria && subcategoria.trim()) {
      filtro.subcategory = subcategoria.trim().toLowerCase();
    }

    // 💰 Filtro por rango de precio
    if (!isNaN(precioMin) || !isNaN(precioMax)) {
      filtro.price = {};
      if (!isNaN(precioMin)) filtro.price.$gte = parseFloat(precioMin);
      if (!isNaN(precioMax)) filtro.price.$lte = parseFloat(precioMax);
    }

    const products = await Product.find(filtro)
      .sort({ createdAt: -1 }) // 🕒 Más recientes primero
      .lean(); // ⚡ Mejora de rendimiento

    console.log(`✅ ${products.length} productos encontrados con filtros:`, filtro);
    res.status(200).json(products);

  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).json({
      message: '❌ Error del servidor al obtener productos',
      error: error.message
    });
  }
};

module.exports = getAllProducts;
