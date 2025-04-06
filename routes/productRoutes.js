const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// 🧠 Controladores
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// 🔐 Middleware
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');
const upload = require('../middleware/multer');

// 📦 Rutas de productos

// 🔓 Obtener todos los productos (pública, considera paginación si hay muchos)
router.get('/', getAllProducts);

// ➕ Crear producto (solo admin, con imagen + validación)
router.post(
  '/',
  authMiddleware,
  adminOnly,
  upload.single('imagen'),
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('price').isNumeric().withMessage('El precio debe ser numérico'),
    body('category').notEmpty().withMessage('La categoría es obligatoria')
  ],
  createProduct
);

// ✏️ Actualizar producto (solo admin, imagen opcional)
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  upload.single('imagen'),
  updateProduct
);

// 🗑️ Eliminar producto (solo admin)
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  deleteProduct
);

module.exports = router;
