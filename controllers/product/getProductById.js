const Product = require('../../models/Product');

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: '❌ Producto no encontrado' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("❌ Error buscando producto por ID:", error.message);
    res.status(500).json({ message: "❌ Error del servidor" });
  }
};

module.exports = getProductById;
