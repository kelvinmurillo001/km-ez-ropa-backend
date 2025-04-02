const express = require("express");
const router = express.Router();
const { getVisitas } = require("../controllers/statsController");

router.get("/contador", getVisitas);

module.exports = router;
