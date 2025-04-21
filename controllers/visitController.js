const fs = require('fs').promises;
const path = require('path');

// 📁 Ruta del archivo donde se almacenan las visitas
const filePath = path.join(__dirname, '..', 'data', 'visitas.json');

/**
 * 📈 Registrar una nueva visita
 */
const registrarVisita = async (req, res) => {
  try {
    let count = 0;

    try {
      const data = await fs.readFile(filePath, 'utf8');
      const json = JSON.parse(data);
      const visitasGuardadas = json.count ?? json.visitas;

      if (typeof visitasGuardadas === 'number' && visitasGuardadas >= 0) {
        count = visitasGuardadas;
      } else {
        console.warn("⚠️ Campo de conteo inválido, se reinicia a 0");
      }
    } catch (error) {
      console.warn("⚠️ visitas.json no existe o está corrupto, se inicia desde cero.");
    }

    count += 1;

    await fs.writeFile(filePath, JSON.stringify({ count }, null, 2));

    return res.json({ message: '✅ Visita registrada', total: count });

  } catch (err) {
    console.error('❌ Error registrando visita:', err);
    return res.status(500).json({ message: '❌ Error interno al registrar visita' });
  }
};

/**
 * 📊 Obtener total de visitas acumuladas
 */
const obtenerVisitas = async (req, res) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(data);
    const visitas = json.count ?? json.visitas;
    const total = (typeof visitas === 'number' && visitas >= 0) ? visitas : 0;

    return res.json({ total });

  } catch (err) {
    console.error('❌ Error leyendo visitas:', err);
    return res.status(500).json({ message: '❌ Error al obtener visitas' });
  }
};

module.exports = {
  registrarVisita,
  obtenerVisitas
};
