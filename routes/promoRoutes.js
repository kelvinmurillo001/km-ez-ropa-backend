// routes/promoRoutes.js

const express = require('express');
const router = express.Router();

const {
  getPromotion,
  updatePromotion
} = require('../controllers/promoController'); // asegúrate que el nombre es correcto

// Rutas
router.get('/', getPromotion);
router.put('/', updatePromotion);

module.exports = router;
