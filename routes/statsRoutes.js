const express = require('express')
const router = express.Router()

// 🛡️ Middlewares de seguridad
const authMiddleware = require('../middleware/authMiddleware')
const adminOnly = require('../middleware/adminOnly')

// 📊 Controladores
const { getResumenEstadisticas } = require('../controllers/statsController')

/* -------------------------------------------------------------------------- */
/* 📈 RUTAS DE ESTADÍSTICAS (SOLO ADMIN)                                      */
/* -------------------------------------------------------------------------- */

/**
 * 📊 Obtener resumen de estadísticas para el panel administrativo
 * GET /api/stats/resumen
 *
 * Incluye:
 * - Total de productos
 * - Productos destacados
 * - Pedidos del día
 * - Total de pedidos
 * - Ventas totales
 * - Visitas acumuladas
 * - Agrupación de productos por categoría
 *
 * 🔒 Acceso restringido a administradores
 */
router.get('/resumen', authMiddleware, adminOnly, getResumenEstadisticas)

module.exports = router
