// 📁 backend/controllers/products/index.js

import getAllProducts from './getAllProducts.js';
import getProductById from './getProductById.js';
import createProduct from './createProduct.js';
import updateProduct from './updateProduct.js';
import deleteProduct from './deleteProduct.js';
import getProductBySlug from './getProductBySlug.js'; // ✅ NUEVO

// 📦 Exportación agrupada para facilitar el mantenimiento y la importación
export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug
};
