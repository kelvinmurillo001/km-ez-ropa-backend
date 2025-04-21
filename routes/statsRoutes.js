const express = require("express");
const router = express.Router();

// 🛡️ Middlewares de seguridad
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

// 📊 Controlador
const { getResumenEstadisticas } = require("../controllers/statsController");

/* -------------------------------------------------------------------------- */
/* 📈 RUTAS DE ESTADÍSTICAS (SOLO ADMIN)                                      */
/* -------------------------------------------------------------------------- */

/**
 * 📊 Obtener resumen de estadísticas para el panel administrativo
 * GET /api/stats/resumen
 * 
 * 🔒 Acceso: SOLO ADMIN
 * Incluye:
 * - Total de productos
 * - Productos destacados
 * - Pedidos del día
 * - Total de pedidos
 * - Ventas totales
 * - Visitas
 * - Productos agrupados por categoría
 */
router.get("/resumen", authMiddleware, adminOnly, getResumenEstadisticas);

module.exports = router;
