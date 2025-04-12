const express = require("express");
const router = express.Router();

// 🛡️ Middlewares de seguridad
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

// 📊 Controlador de estadísticas
const { getResumenEstadisticas } = require("../controllers/statsController");

/**
 * 📊 Obtener resumen de estadísticas para el panel administrativo
 * - Incluye: total de productos, productos destacados, pedidos del día,
 *   total de pedidos, ventas totales, visitas, y productos por categoría
 * - Acceso: SOLO ADMIN
 */
router.get("/resumen", authMiddleware, adminOnly, getResumenEstadisticas);

module.exports = router;
