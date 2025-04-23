// 📁 backend/controllers/products/index.js

import getAllProducts from './getAllProducts.js' // GET /api/products
import getProductById from './getProductById.js' // GET /api/products/:id
import createProduct from './createProduct.js' // POST /api/products
import updateProduct from './updateProduct.js' // PUT /api/products/:id
import deleteProduct from './deleteProduct.js' // DELETE /api/products/:id

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}
