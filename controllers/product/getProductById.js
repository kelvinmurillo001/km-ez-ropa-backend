const mongoose = require('mongoose');
const Product = require('../../models/Product');

/**
 * 🔍 Obtener un producto por su ID
 * @route GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔐 Validar formato de ObjectId de MongoDB
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: '⚠️ El ID proporcionado no es válido',
        id
      });
    }

    // 📦 Buscar producto en la base de datos
    const producto = await Product.findById(id).lean();

    // ❌ No encontrado
    if (!producto) {
      return res.status(404).json({
        message: '❌ Producto no encontrado',
        id
      });
    }

    // ✅ Retornar producto encontrado
    return res.status(200).json({
      message: '✅ Producto encontrado correctamente',
      producto
    });

  } catch (error) {
    console.error("❌ Error en getProductById:", error);
    return res.status(500).json({
      message: '❌ Error interno del servidor al obtener el producto',
      error: error.message
    });
  }
};

module.exports = getProductById;
