const mongoose = require('mongoose');
const Product = require('../../models/Product');

/**
 * 🔍 Obtener un producto por su ID
 * @route GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validación de ID válida de MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '⚠️ ID no válido' });
    }

    // 🔍 Buscar el producto por ID
    const producto = await Product.findById(id);

    if (!producto) {
      return res.status(404).json({ message: '❌ Producto no encontrado' });
    }

    // ✅ Retornar producto
    res.status(200).json(producto);
  } catch (error) {
    console.error("❌ Error en getProductById:", error.message);
    res.status(500).json({ message: '❌ Error del servidor al obtener el producto' });
  }
};

module.exports = getProductById;
