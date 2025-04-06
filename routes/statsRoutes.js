const express = require("express");
const router = express.Router();

const { getVisitas } = require("../controllers/statsController");
const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminOnly");

// 📊 Ruta segura para ver visitas (solo admin)
router.get("/contador", authMiddleware, adminOnly, getVisitas);

module.exports = router;
