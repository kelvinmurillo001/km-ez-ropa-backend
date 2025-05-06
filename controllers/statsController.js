// 📁 backend/controllers/statsController.js
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../config/configuracionesito.js'
import logger from '../utils/logger.js'

// 📍 Corrección para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 📍 Ruta al archivo de visitas
const visitasPath = path.join(__dirname, '..', 'data', 'visitas.json')

/**
 * 📊 Obtener estadísticas generales para el dashboard de administrador
 * @route   GET /api/stats/resumen
 * @access  Admin
 */
export const getResumenEstadisticas = async (req, res) => {
  try {
    // 🔍 Obtener productos y pedidos simultáneamente
    const [productos, pedidos] = await Promise.all([
      Product.find().select('-__v').lean(),
      Order.find().select('-__v').lean()
    ])

    // 📈 Leer visitas desde archivo JSON
    let visitas = 0
    try {
      const raw = await fs.readFile(visitasPath, 'utf-8')
      const json = JSON.parse(raw)
      visitas = Number.isInteger(json.count)
        ? json.count
        : Number.isInteger(json.visitas)
        ? json.visitas
        : 0
    } catch (err) {
      logger.warn(`⚠️ No se pudo leer visitas.json: ${err.message}`)
    }

    // 📅 Calcular cuántos pedidos se hicieron hoy
    const inicioDia = new Date()
    inicioDia.setHours(0, 0, 0, 0)
    const pedidosHoy = pedidos.filter(p => new Date(p.createdAt) >= inicioDia).length

    // 🧮 Cálculos agregados
    const totalProductos = productos.length
    const productosDestacados = productos.filter(p => p.featured).length
    const totalPedidos = pedidos.length
    const ventasTotales = pedidos
      .filter(p => p.estado === 'enviado')
      .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0)

    const productosPorCategoria = productos.reduce((acc, p) => {
      const categoria = (p.category || 'sin categoría').trim().toLowerCase()
      acc[categoria] = (acc[categoria] || 0) + 1
      return acc
    }, {})

    // 📤 Enviar respuesta con estadísticas
    return res.status(200).json({
      ok: true,
      message: '✅ Estadísticas generadas correctamente.',
      data: {
        totalProductos,
        productosDestacados,
        pedidosTotales: totalPedidos,
        pedidosHoy,
        totalVisitas: visitas,
        ventasTotales: Number(ventasTotales.toFixed(2)),
        productosPorCategoria
      }
    })
  } catch (err) {
    logger.error('❌ Error al generar estadísticas:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al generar estadísticas.',
      ...(config.env !== 'production' && { error: err.message })
    })
  }
}
