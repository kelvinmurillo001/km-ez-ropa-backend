// 📁 backend/controllers/visitController.js
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// 🧭 Ruta absoluta segura (para __dirname en ESM)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const filePath = path.join(__dirname, '..', 'data', 'visitas.json')

/**
 * 🧮 Leer visitas desde archivo
 */
const leerVisitas = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    const json = JSON.parse(data)
    const visitas = json.count ?? json.visitas
    return typeof visitas === 'number' && visitas >= 0 ? visitas : 0
  } catch (error) {
    console.warn('⚠️ Archivo de visitas no encontrado o corrupto. Se usa 0.')
    return 0
  }
}

/**
 * 📈 Registrar una nueva visita
 */
export const registrarVisita = async (req, res) => {
  try {
    const visitasActuales = await leerVisitas()
    const nuevasVisitas = visitasActuales + 1

    await fs.writeFile(filePath, JSON.stringify({ count: nuevasVisitas }, null, 2))

    return res.status(200).json({
      ok: true,
      message: '✅ Visita registrada correctamente',
      data: { total: nuevasVisitas }
    })
  } catch (err) {
    console.error('❌ Error al registrar visita:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al registrar visita',
      error: err.message
    })
  }
}

/**
 * 📊 Obtener total de visitas
 */
export const obtenerVisitas = async (req, res) => {
  try {
    const total = await leerVisitas()

    return res.status(200).json({
      ok: true,
      message: '✅ Total de visitas obtenido correctamente',
      data: { total }
    })
  } catch (err) {
    console.error('❌ Error al obtener visitas:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener visitas',
      error: err.message
    })
  }
}
