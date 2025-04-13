const Product = require('../../models/Product');

/**
 * 📥 Obtener todos los productos visibles (público)
 * @route GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      name: { $exists: true, $ne: "" },
      price: { $exists: true, $gt: 0 },
      images: { $exists: true, $not: { $size: 0 } }
    }).sort({ createdAt: -1 }).lean();

    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).json({ message: '❌ Error del servidor al obtener productos' });
  }
};

module.exports = getAllProducts;
