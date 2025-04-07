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
const multer = require('multer');

// 🧠 Configuración Multer para múltiples imágenes en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📦 Rutas de productos

// 🔓 Obtener todos los productos
router.get('/', getAllProducts);

// ➕ Crear producto con múltiples imágenes por talla
router.post(
  '/',
  authMiddleware,
  adminOnly,
  upload.fields([
    { name: 'image_S' },
    { name: 'image_M' },
    { name: 'image_L' },
    { name: 'image_XL' },
    { name: 'image_XXL' } // puedes añadir más tallas aquí si usas otras
  ]),
  [
    body('name').notEmpty().withMessage('El nombre es obligatorio'),
    body('price').isNumeric().withMessage('El precio debe ser numérico'),
    body('category').notEmpty().withMessage('La categoría es obligatoria')
  ],
  createProduct
);

// ✏️ Actualizar producto (imágenes por talla opcionales)
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  upload.fields([
    { name: 'image_S' },
    { name: 'image_M' },
    { name: 'image_L' },
    { name: 'image_XL' },
    { name: 'image_XXL' }
  ]),
  updateProduct
);

// 🗑️ Eliminar producto
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  deleteProduct
);

module.exports = router;
