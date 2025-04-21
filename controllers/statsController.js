const Product = require("../models/Product");
const Order = require("../models/Order");
const fs = require("fs").promises;
const path = require("path");

const visitasPath = path.join(__dirname, "..", "data", "visitas.json");

/**
 * 📊 Obtener estadísticas del panel de administración
 */
const getResumenEstadisticas = async (req, res) => {
  try {
    // 🧾 Obtener todos los productos y pedidos
    const productos = await Product.find();
    const pedidos = await Order.find();

    // 👁️ Leer visitas desde archivo
    let visitas = 0;
    try {
      const raw = await fs.readFile(visitasPath, "utf-8");
      const json = JSON.parse(raw);
      const visitasLeidas = json.count ?? json.visitas;
      if (typeof visitasLeidas === "number" && visitasLeidas >= 0) {
        visitas = visitasLeidas;
      }
    } catch (err) {
      console.warn(`⚠️ No se pudo leer visitas desde ${visitasPath}, se asumirá 0 visitas.`);
    }

    // 🕛 Fecha de hoy a las 00:00
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 📦 Métricas
    const productosDestacados = productos.filter(p => p.featured).length;

    const pedidosHoy = pedidos.filter(p => {
      const fecha = new Date(p.createdAt);
      return fecha >= hoy && !isNaN(fecha);
    }).length;

    const pedidosEnviados = pedidos.filter(p => p.estado === "enviado");
    const ventasTotales = pedidosEnviados.reduce(
      (sum, p) => sum + parseFloat(p.total || 0),
      0
    );

    const productosPorCategoria = {};
    for (const p of productos) {
      const categoria = (p.category || "Sin categoría").trim().toLowerCase();
      productosPorCategoria[categoria] = (productosPorCategoria[categoria] || 0) + 1;
    }

    // 📤 Respuesta
    return res.json({
      totalProductos: productos.length,
      productosDestacados,
      pedidosTotales: pedidos.length,
      pedidosHoy,
      totalVisitas: visitas,
      ventasTotales: Number(ventasTotales),
      productosPorCategoria
    });

  } catch (err) {
    console.error("❌ Error al obtener estadísticas:", err);
    return res.status(500).json({
      message: "❌ Error al generar estadísticas",
      error: err.message
    });
  }
};

module.exports = {
  getResumenEstadisticas
};
