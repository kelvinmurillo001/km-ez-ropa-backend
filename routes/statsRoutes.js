// routes/statsRoutes.js

const express = require("express");
const router = express.Router();

// 🔐 Middlewares
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

// 📊 Controlador
const { getResumenEstadisticas } = require("../controllers/statsController");

/**
 * 📊 Ruta protegida para estadísticas generales
 * - Acceso: Solo admins autenticados
 * - Retorna: productos, visitas y ventas
 */
router.get("/resumen", authMiddleware, adminOnly, getResumenEstadisticas);

module.exports = router;
