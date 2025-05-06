// 📁 backend/controllers/visitController.js
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../config/configuracionesito.js'
import logger from '../utils/logger.js' // 📦 Logger centralizado

// 📍 Corrección para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 📍 Ruta al archivo de visitas (configurable si se requiere)
const visitasFilePath = path.join(__dirname, '..', 'data', 'visitas.json')

/**
 * 🧮 Leer contador de visitas desde JSON
 * @returns {Promise<number>}
 */
const leerVisitas = async () => {
  try {
    const contenido = await fs.readFile(visitasFilePath, 'utf-8')
    const json = JSON.parse(contenido)
    const count =
      typeof json.count === 'number' && json.count >= 0
        ? json.count
        : typeof json.visitas === 'number' && json.visitas >= 0
        ? json.visitas
        : 0
    return count
  } catch (err) {
    if (config.env !== 'production') {
      logger.warn(`⚠️ No se pudo leer visitas.json: ${err.message}`)
    }
    return 0
  }
}

/**
 * 📈 Registrar una nueva visita incrementando el contador
 * @route   POST /api/visitas
 * @access  Público
 */
export const registrarVisita = async (req, res) => {
  try {
    const actuales = await leerVisitas()
    const nuevas = actuales + 1

    await fs.writeFile(visitasFilePath, JSON.stringify({ count: nuevas }, null, 2))

    return res.status(200).json({
      ok: true,
      message: '✅ Visita registrada correctamente.',
      data: { totalVisitas: nuevas }
    })
  } catch (err) {
    logger.error('❌ Error registrando visita:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error al registrar visita.',
      ...(config.env !== 'production' && { error: err.message })
    })
  }
}

/**
 * 📊 Obtener total de visitas acumuladas
 * @route   GET /api/visitas
 * @access  Público
 */
export const obtenerVisitas = async (_req, res) => {
  try {
    const total = await leerVisitas()
    return res.status(200).json({
      ok: true,
      message: '✅ Total de visitas obtenido correctamente.',
      data: { totalVisitas: total }
    })
  } catch (err) {
    logger.error('❌ Error obteniendo visitas:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error al obtener visitas.',
      ...(config.env !== 'production' && { error: err.message })
    })
  }
}
