// 📁 backend/controllers/statsController.js
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

// 📍 __dirname compatible con ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Ruta al archivo de visitas
const visitasPath = path.join(__dirname, '..', 'data', 'visitas.json');

/**
 * 📊 GET /api/stats/resumen
 * 🔐 Acceso: Admin
 */
export const getResumenEstadisticas = async (_req, res) => {
  try {
    // 🧪 Obtener productos y pedidos simultáneamente
    const [productos, pedidos] = await Promise.all([
      Product.find().select('-__v').lean(),
      Order.find().select('-__v').lean()
    ]);

    // 📈 Visitas desde JSON
    const visitas = await obtenerVisitas();

    // 📅 Pedidos realizados hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const pedidosHoy = pedidos.filter(p => new Date(p.createdAt) >= hoy).length;

    // 📦 Totales
    const totalProductos = productos.length;
    const productosDestacados = productos.filter(p => p.featured).length;
    const totalPedidos = pedidos.length;
    const ventasTotales = pedidos
      .filter(p => p.estado === 'enviado')
      .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);

    // 📊 Productos por categoría
    const productosPorCategoria = productos.reduce((acc, p) => {
      const cat = (p.category || 'sin_categoria').trim().toLowerCase();
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

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
    });

  } catch (err) {
    logger.error('❌ Error en resumen de estadísticas:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al generar estadísticas.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

/**
 * 📂 Cargar visitas desde visitas.json
 */
async function obtenerVisitas() {
  try {
    const raw = await fs.readFile(visitasPath, 'utf-8');
    const json = JSON.parse(raw);

    if (Number.isInteger(json.count)) return json.count;
    if (Number.isInteger(json.visitas)) return json.visitas;

    logger.warn('⚠️ visits.json sin campo válido');
    return 0;

  } catch (err) {
    logger.warn(`⚠️ No se pudo leer visitas.json: ${err.message}`);
    return 0;
  }
}
