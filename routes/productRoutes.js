// routes/productRoutes.js

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

// 🔐 Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// 📦 Rutas de Productos

/**
 * 📥 Obtener todos los productos (Público)
 * - Devuelve todos los productos ordenados por más recientes
 */
router.get('/', getAllProducts);

/**
 * ➕ Crear un nuevo producto (Protegido / Solo Admin)
 * - Requiere token válido + rol admin
 * - Debe enviar al menos una variante con info de Cloudinary
 */
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

/**
 * ✏️ Actualizar un producto existente (Protegido / Solo Admin)
 * - Elimina variantes anteriores y las imágenes de Cloudinary
 * - Reemplaza por las nuevas variantes recibidas
 */
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

/**
 * 🗑️ Eliminar producto (Protegido / Solo Admin)
 * - Elimina también las imágenes subidas en Cloudinary
 */
router.delete('/:id', authMiddleware, adminOnly, deleteProduct);

module.exports = router;
