// 📁 backend/controllers/statsController.js
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Necesario para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 📍 Ruta al archivo de visitas
const visitasPath = path.join(__dirname, '..', 'data', 'visitas.json')

/**
 * 📊 Obtener estadísticas generales para dashboard admin
 */
export const getResumenEstadisticas = async (req, res) => {
  try {
    // 🔍 Obtener productos y pedidos
    const [productos, pedidos] = await Promise.all([
      Product.find(),
      Order.find()
    ])

    // 👁️ Leer visitas desde archivo local
    let visitas = 0
    try {
      const raw = await fs.readFile(visitasPath, 'utf-8')
      const json = JSON.parse(raw)
      const visitasLeidas = json.count ?? json.visitas
      if (typeof visitasLeidas === 'number' && visitasLeidas >= 0) {
        visitas = visitasLeidas
      }
    } catch (err) {
      console.warn(`⚠️ No se pudo leer visitas desde visitas.json: ${err.message}`)
    }

    // 📅 Calcular fecha de hoy (inicio del día)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    // 🧮 Cálculos
    const productosDestacados = productos.filter(p => p.featured).length

    const pedidosHoy = pedidos.filter(p => {
      const fechaPedido = new Date(p.createdAt)
      return !isNaN(fechaPedido) && fechaPedido >= hoy
    }).length

    const pedidosEnviados = pedidos.filter(p => p.estado === 'enviado')
    const ventasTotales = pedidosEnviados.reduce((sum, p) => sum + parseFloat(p.total || 0), 0)

    const productosPorCategoria = productos.reduce((acc, p) => {
      const cat = (p.category || 'sin categoría').trim().toLowerCase()
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

    // 📤 Respuesta al cliente
    return res.status(200).json({
      ok: true,
      message: '✅ Estadísticas generales obtenidas correctamente',
      data: {
        totalProductos: productos.length,
        productosDestacados,
        pedidosTotales: pedidos.length,
        pedidosHoy,
        totalVisitas: visitas,
        ventasTotales: Number(ventasTotales.toFixed(2)),
        productosPorCategoria
      }
    })
  } catch (err) {
    console.error('❌ Error al generar estadísticas:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al generar estadísticas',
      error: err.message
    })
  }
}
