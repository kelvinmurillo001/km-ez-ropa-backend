const getAllProducts = require('./getAllProducts');
const getProductById = require('./getProductById');
const createProduct = require('./createProduct'); // ✅ agregar esta línea
const updateProduct = require('./updateProduct');
const deleteProduct = require('./deleteProduct');

module.exports = {
  getAllProducts,
  getProductById,
  createProduct, // ✅ y esta también
  updateProduct,
  deleteProduct
};
