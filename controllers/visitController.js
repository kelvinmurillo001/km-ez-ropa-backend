// 📁 backend/controllers/visitController.js

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// 📍 Corrección para __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 📂 Ruta al archivo de visitas
const filePath = path.join(__dirname, '..', 'data', 'visitas.json')

/* -------------------------------------------------------------------------- */
/* 🧮 Función auxiliar para leer visitas                                       */
/* -------------------------------------------------------------------------- */
const leerVisitas = async () => {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    const json = JSON.parse(data)
    const visitas = json.count ?? json.visitas
    return typeof visitas === 'number' && visitas >= 0 ? visitas : 0
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Archivo de visitas no encontrado o inválido:', error.message)
    }
    return 0
  }
}

/* -------------------------------------------------------------------------- */
/* 📈 Registrar una nueva visita                                              */
/* @route POST /api/visitas                                                   */
/* -------------------------------------------------------------------------- */
export const registrarVisita = async (req, res) => {
  try {
    const visitasActuales = await leerVisitas()
    const nuevasVisitas = visitasActuales + 1

    await fs.writeFile(filePath, JSON.stringify({ count: nuevasVisitas }, null, 2))

    return res.status(200).json({
      ok: true,
      message: '✅ Visita registrada correctamente.',
      data: { total: nuevasVisitas }
    })
  } catch (err) {
    console.error('❌ Error al registrar visita:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al registrar visita.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}

/* -------------------------------------------------------------------------- */
/* 📊 Obtener total de visitas                                                */
/* @route GET /api/visitas                                                    */
/* -------------------------------------------------------------------------- */
export const obtenerVisitas = async (req, res) => {
  try {
    const total = await leerVisitas()

    return res.status(200).json({
      ok: true,
      message: '✅ Total de visitas obtenido correctamente.',
      data: { total }
    })
  } catch (err) {
    console.error('❌ Error al obtener visitas:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener visitas.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    })
  }
}
