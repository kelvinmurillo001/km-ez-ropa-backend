const express = require('express');
const router = express.Router();

// 🧠 Controladores
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// 🔐 Middleware de autenticación y subida de archivos
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

// 📦 Rutas de productos

// 🔓 Obtener todos los productos (pública)
router.get('/', getAllProducts);

// ➕ Crear producto (requiere auth + imagen)
router.post(
  '/',
  authMiddleware,
  upload.single('imagen'),
  createProduct
);

// ✏️ Actualizar producto (requiere auth + imagen)
router.put(
  '/:id',
  authMiddleware,
  upload.single('imagen'),
  updateProduct
);

// 🗑️ Eliminar producto (requiere auth)
router.delete(
  '/:id',
  authMiddleware,
  deleteProduct
);

module.exports = router;
