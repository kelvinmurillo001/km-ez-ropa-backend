const Product = require("../models/Product");
const Order = require("../models/Order");
const fs = require("fs").promises;
const path = require("path");

const visitasPath = path.join(__dirname, "..", "data", "visitas.json");

/**
 * 📊 Obtener estadísticas generales para dashboard admin
 */
const getResumenEstadisticas = async (req, res) => {
  try {
    const productos = await Product.find();
    const pedidos = await Order.find();

    // 👁️ Leer visitas desde archivo JSON
    let visitas = 0;
    try {
      const raw = await fs.readFile(visitasPath, "utf-8");
      const json = JSON.parse(raw);
      const visitasLeidas = json.count ?? json.visitas;

      if (typeof visitasLeidas === "number" && visitasLeidas >= 0) {
        visitas = visitasLeidas;
      }
    } catch (err) {
      console.warn(`⚠️ No se pudo leer visitas desde visitas.json: ${err.message}`);
    }

    // 📅 Fecha de hoy (00:00)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 🔢 Cálculos
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
      const categoria = (p.category || "sin categoría").trim().toLowerCase();
      productosPorCategoria[categoria] = (productosPorCategoria[categoria] || 0) + 1;
    }

    // 📤 Respuesta final
    return res.status(200).json({
      ok: true,
      message: "✅ Estadísticas generales obtenidas correctamente",
      data: {
        totalProductos: productos.length,
        productosDestacados,
        pedidosTotales: pedidos.length,
        pedidosHoy,
        totalVisitas: visitas,
        ventasTotales: Number(ventasTotales.toFixed(2)),
        productosPorCategoria
      }
    });

  } catch (err) {
    console.error("❌ Error al generar estadísticas:", err);
    return res.status(500).json({
      ok: false,
      message: "❌ Error interno al generar estadísticas",
      error: err.message
    });
  }
};

module.exports = {
  getResumenEstadisticas
};
