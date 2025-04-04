// routes/promoRoutes.js
const express = require('express');
const router = express.Router();

const {
  getPromotion,
  updatePromotion
} = require('../controllers/promoController');

const authMiddleware = require('../middleware/authMiddleware');

// 📢 Rutas de promociones

// 🔓 Obtener la promoción activa (pública)
router.get('/', getPromotion);

// 🔐 Crear o actualizar promoción (protegido)
router.put('/', authMiddleware, updatePromotion);

module.exports = router;
