/**
 * 📦 Controladores de productos
 */
const getAllProducts = require('./getAllProducts') // GET /api/products
const getProductById = require('./getProductById') // GET /api/products/:id
const createProduct = require('./createProduct') // POST /api/products
const updateProduct = require('./updateProduct') // PUT /api/products/:id
const deleteProduct = require('./deleteProduct') // DELETE /api/products/:id

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}
