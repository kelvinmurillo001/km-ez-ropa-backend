const fs = require("fs");
const path = require("path");

const visitasPath = path.join(__dirname, "../visitas.json");

const getVisitas = (req, res) => {
  try {
    const data = fs.readFileSync(visitasPath, "utf-8");
    const json = JSON.parse(data);
    res.json({ total: json.visitas || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error leyendo visitas." });
  }
};

module.exports = { getVisitas };
