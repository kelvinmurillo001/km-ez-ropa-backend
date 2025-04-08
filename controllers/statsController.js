const fs = require("fs").promises;
const path = require("path");

// 📁 Ruta al archivo de visitas
const visitasPath = path.join(__dirname, "../data/visitas.json");

/**
 * 📊 Obtener contador de visitas desde visitas.json
 * - Parsea archivo y devuelve total de visitas
 */
const getVisitas = async (req, res) => {
  try {
    const data = await fs.readFile(visitasPath, "utf-8");

    let json = {};
    try {
      json = JSON.parse(data);
    } catch (parseError) {
      console.error("❌ Error al parsear visitas.json:", parseError.message);
      return res.status(500).json({ message: "Error al procesar datos de visitas." });
    }

    // 📈 Valor esperado: { count: number } o { visitas: number }
    const total = json.count ?? json.visitas ?? 0;

    res.json({ total });
  } catch (error) {
    console.error("❌ Error leyendo visitas.json:", error.message);
    res.status(500).json({ message: "Error leyendo archivo de visitas." });
  }
};

module.exports = { getVisitas };
