// 📁 backend/controllers/visitController.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📂 Ruta del archivo visitas.json
const visitasFilePath = path.join(__dirname, '..', 'data', 'visitas.json');

/**
 * 🧮 Leer visitas desde JSON o inicializar si no existe
 * @returns {Promise<number>}
 */
const leerVisitas = async () => {
  try {
    const contenido = await fs.readFile(visitasFilePath, 'utf-8');
    const json = JSON.parse(contenido);
    const count = Number.isInteger(json.count)
      ? json.count
      : Number.isInteger(json.visitas)
      ? json.visitas
      : 0;
    return Math.max(count, 0);
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.warn('📂 visitas.json no encontrado. Creando archivo...');
      await fs.writeFile(visitasFilePath, JSON.stringify({ count: 0 }, null, 2));
      return 0;
    }

    logger.warn(`⚠️ Error al leer visitas.json: ${err.message}`);
    return 0;
  }
};

/**
 * 📈 POST /api/visitas
 * ➤ Registra una nueva visita con respaldo diario
 */
export const registrarVisita = async (_req, res) => {
  try {
    const actuales = await leerVisitas();
    const nuevas = actuales + 1;

    // 📁 Crear respaldo
    const backupName = `visitas_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    const backupPath = path.join(__dirname, '..', 'data', backupName);

    try {
      await fs.copyFile(visitasFilePath, backupPath);
      logger.info(`📁 Respaldo de visitas creado: ${backupName}`);
    } catch (backupErr) {
      logger.warn(`⚠️ No se pudo crear respaldo de visitas: ${backupErr.message}`);
    }

    // ✍️ Guardar nuevo conteo
    await fs.writeFile(visitasFilePath, JSON.stringify({ count: nuevas }, null, 2));

    return res.status(200).json({
      ok: true,
      message: '✅ Visita registrada correctamente.',
      data: { totalVisitas: nuevas }
    });
  } catch (err) {
    logger.error('❌ Error al registrar visita:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error al registrar visita.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

/**
 * 📊 GET /api/visitas
 * ➤ Devuelve la cantidad total de visitas registradas
 */
export const obtenerVisitas = async (_req, res) => {
  try {
    const total = await leerVisitas();

    return res.status(200).json({
      ok: true,
      message: '✅ Total de visitas obtenido correctamente.',
      data: { totalVisitas: total }
    });
  } catch (err) {
    logger.error('❌ Error al obtener visitas:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error al obtener visitas.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};
