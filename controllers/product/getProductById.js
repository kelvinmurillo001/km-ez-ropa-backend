const mongoose = require('mongoose');
const Product = require('../../models/Product');

/**
 * 🔍 Obtener un producto por su ID
 * @route GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔐 Validar que sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '⚠️ El ID proporcionado no es válido' });
    }

    // 🔍 Buscar el producto en la base de datos
    const producto = await Product.findById(id).lean(); // lean para mejorar rendimiento si solo se necesita lectura

    if (!producto) {
      return res.status(404).json({ message: '❌ Producto no encontrado' });
    }

    // ✅ Éxito: retornar producto
    res.status(200).json(producto);

  } catch (error) {
    console.error("❌ Error en getProductById:", error.message);
    res.status(500).json({
      message: '❌ Error del servidor al obtener el producto',
      error: error.message
    });
  }
};

module.exports = getProductById;
