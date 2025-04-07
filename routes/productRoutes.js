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

// 📦 Rutas de productos

// 🔓 Obtener todos los productos (pública)
router.get('/', getAllProducts);

// ➕ Crear producto (admin, recibe variantes con imágenes subidas desde el cliente)
router.post(
  '/',
  authMiddleware,
  adminOnly,
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('price').isNumeric().withMessage('El precio debe ser numérico'),
    body('category').notEmpty().withMessage('La categoría es obligatoria'),
    body('subcategory').notEmpty().withMessage('La subcategoría es obligatoria'),
    body('variants').isArray({ min: 1 }).withMessage('Se requiere al menos una variante')
  ],
  createProduct
);

// ✏️ Actualizar producto (admin)
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  [
    body('name').optional().notEmpty(),
    body('price').optional().isNumeric(),
    body('variants').optional().isArray()
  ],
  updateProduct
);

// 🗑️ Eliminar producto (admin)
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  deleteProduct
);

module.exports = router;
