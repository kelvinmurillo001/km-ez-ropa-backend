const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const authMiddleware = require('../middleware/authMiddleware');

// 📦 Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png, .webp images are allowed'));
  }
};

const upload = multer({ storage, fileFilter });

// 🔓 Public route
router.get('/', getAllProducts);

// 🔐 Protected routes
router.post('/', authMiddleware, upload.single('imagen'), createProduct);
router.put('/:id', authMiddleware, upload.single('imagen'), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
