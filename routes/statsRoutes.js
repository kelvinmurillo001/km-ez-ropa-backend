const express = require("express");
const router = express.Router();

const { getResumenEstadisticas } = require("../controllers/statsController");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

// 📊 Ruta segura para ver estadísticas (solo admin)
router.get("/resumen", authMiddleware, adminOnly, getResumenEstadisticas);

module.exports = router;
