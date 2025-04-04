const fs = require('fs').promises;
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'visitas.json');

// 📈 Registrar una visita
const registrarVisita = async (req, res) => {
  try {
    let count = 0;

    try {
      const data = await fs.readFile(filePath, 'utf8');
      const json = JSON.parse(data);
      count = json.count || 0;
    } catch (error) {
      console.warn("⚠️ Archivo visitas.json no existe o está vacío, inicializando...");
    }

    count += 1;

    await fs.writeFile(filePath, JSON.stringify({ count }));

    res.json({ message: "✅ Visita registrada", total: count });
  } catch (err) {
    console.error("❌ Error registrando visita:", err);
    res.status(500).json({ message: "Error registrando visita" });
  }
};

// 📊 Obtener total de visitas
const obtenerVisitas = async (req, res) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(data);
    const count = json.count || 0;

    res.json({ total: count });
  } catch (err) {
    console.error("❌ Error leyendo visitas:", err);
    res.status(500).json({ message: "Error leyendo visitas" });
  }
};

module.exports = {
  registrarVisita,
  obtenerVisitas
};
