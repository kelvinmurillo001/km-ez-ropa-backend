const fs = require('fs').promises;
const path = require('path');

// 📁 Ruta del archivo de visitas
const filePath = path.join(__dirname, '..', 'data', 'visitas.json');

/**
 * 📈 Registrar una nueva visita
 * - Lee el archivo JSON
 * - Incrementa el contador
 * - Guarda el nuevo valor
 */
const registrarVisita = async (req, res) => {
  try {
    let count = 0;

    try {
      const data = await fs.readFile(filePath, 'utf8');
      const json = JSON.parse(data);
      if (typeof json.count === 'number' && json.count >= 0) {
        count = json.count;
      }
    } catch (error) {
      console.warn("⚠️ visitas.json no existe o está corrupto, inicializando en 0.");
    }

    count += 1;

    await fs.writeFile(filePath, JSON.stringify({ count }, null, 2));
    return res.json({ message: '✅ Visita registrada', total: count });
  } catch (err) {
    console.error('❌ Error registrando visita:', err);
    return res.status(500).json({ message: '❌ Error al registrar visita' });
  }
};

/**
 * 📊 Obtener total de visitas acumuladas
 */
const obtenerVisitas = async (req, res) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const json = JSON.parse(data);
    const count = (typeof json.count === 'number' && json.count >= 0) ? json.count : 0;

    return res.json({ total: count });
  } catch (err) {
    console.error('❌ Error leyendo visitas:', err);
    return res.status(500).json({ message: '❌ Error al obtener visitas' });
  }
};

module.exports = {
  registrarVisita,
  obtenerVisitas
};
