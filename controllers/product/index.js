// controllers/product/index.js

const getAllProducts = require('./getAllProducts');
const getProductById = require('./getProductById');
const createProduct = require('./createProduct');
const updateProduct = require('./updateProduct');
const deleteProduct = require('./deleteProduct');

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
