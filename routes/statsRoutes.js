const express = require("express");
const router = express.Router();

const { getVisitas } = require("../controllers/statsController");

// 📊 Ruta para obtener total de visitas desde archivo visitas.json
router.get("/contador", getVisitas);

module.exports = router;
