const Product = require('../../models/Product');

/**
 * 📥 Obtener todos los productos visibles (público o para panel admin)
 * @route GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      name: { $exists: true, $ne: "" },
      price: { $exists: true, $gt: 0 }
      // 📸 Filtro de imágenes puede agregarse si se requiere en el futuro
    })
      .sort({ createdAt: -1 }) // 🕒 Más recientes primero
      .lean(); // ✅ Objeto plano, más eficiente

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
