const Product = require('../../models/Product');

const getAllProducts = async (req, res) => {
  try {
    // Puedes habilitar filtros o paginación aquí en el futuro
    const products = await Product.find({})
      .sort({ createdAt: -1 }) // Más recientes primero
      .lean(); // Más rápido, devuelve objetos planos

    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error.message);
    res.status(500).json({ message: '❌ Error del servidor al obtener productos' });
  }
};

module.exports = getAllProducts;
