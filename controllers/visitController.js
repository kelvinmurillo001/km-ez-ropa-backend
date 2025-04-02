const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'visitas.json');

// 📈 Registrar una visita
const registrarVisita = (req, res) => {
  try {
    let count = 0;

    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      count = data.count || 0;
    }

    count += 1;
    fs.writeFileSync(filePath, JSON.stringify({ count }));

    res.json({ message: "✅ Visita registrada", total: count });
  } catch (err) {
    console.error("❌ Error registrando visita:", err);
    res.status(500).json({ message: "Error registrando visita" });
  }
};

// 📊 Obtener total de visitas
const obtenerVisitas = (req, res) => {
  try {
    let count = 0;
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      count = data.count || 0;
    }
    res.json({ total: count });
  } catch (err) {
    res.status(500).json({ message: "Error leyendo visitas" });
  }
};

module.exports = {
  registrarVisita,
  obtenerVisitas
};
