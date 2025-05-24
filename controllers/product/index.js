// 📁 backend/controllers/products/index.js

import getAllProducts from './getAllProducts.js';
import getProductById from './getProductById.js';
import createProduct from './createProduct.js';
import updateProduct from './updateProduct.js';
import deleteProduct from './deleteProduct.js';
import getProductBySlug from './getProductBySlug.js';

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug
};
