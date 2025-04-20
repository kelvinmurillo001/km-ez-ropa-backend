const Product = require('../../models/Product');

/**
 * 📥 Obtener todos los productos visibles (público o para panel admin)
 * ✅ Soporta filtros:
 * - nombre: búsqueda parcial por nombre (case-insensitive)
 * - categoria: categoría exacta
 * 
 * @route GET /api/products?nombre=camisa&categoria=hombres
 */
const getAllProducts = async (req, res) => {
  try {
    const { nombre, categoria } = req.query;

    // 🎯 Filtro base
    const filtro = {
      name: { $exists: true, $ne: "" },
      price: { $exists: true, $gt: 0 }
    };

    // 🔍 Búsqueda por nombre (parcial)
    if (nombre && nombre.trim()) {
      filtro.name = { $regex: new RegExp(nombre.trim(), "i") };
    }

    // 🎯 Filtro por categoría
    if (categoria && categoria.trim()) {
      filtro.category = categoria.trim().toLowerCase();
    }

    const products = await Product.find(filtro)
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ ${products.length} productos encontrados`);
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
