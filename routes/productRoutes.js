const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const authMiddleware = require('../middleware/authMiddleware');

// ✅ Usamos configuración modular de multer
const upload = require('../middleware/multer');

// 🔓 Ruta pública para obtener productos
router.get('/', getAllProducts);

// 🔐 Crear producto (con auth + imagen)
router.post('/', authMiddleware, upload.single('imagen'), createProduct);

// ✏️ Actualizar producto (con auth + imagen)
router.put('/:id', authMiddleware, upload.single('imagen'), updateProduct);

// 🗑️ Eliminar producto (con auth)
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
