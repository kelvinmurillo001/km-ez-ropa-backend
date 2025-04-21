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
    // 🧾 Cargar productos y pedidos desde la base de datos
    const productos = await Product.find();
    const pedidos = await Order.find();

    // 👁️ Leer visitas desde archivo local
    let visitas = 0;
    try {
      const raw = await fs.readFile(visitasPath, "utf-8");
      const json = JSON.parse(raw);
      const posibleVisitas = json.count ?? json.visitas;
      if (typeof posibleVisitas === "number" && posibleVisitas >= 0) {
        visitas = posibleVisitas;
      }
    } catch (err) {
      console.warn("⚠️ No se pudo leer visitas.json, se asume 0 visitas.");
    }

    // 🕛 Calcular fecha de hoy a las 00:00
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 📦 Cálculos de métricas
    const productosDestacados = productos.filter(p => p.featured).length;

    const pedidosHoy = pedidos.filter(p => {
      const creado = new Date(p.createdAt);
      return creado >= hoy && !isNaN(creado);
    }).length;

    const pedidosEnviados = pedidos.filter(p => p.estado === "enviado");
    const ventasTotales = pedidosEnviados.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

    const productosPorCategoria = {};
    for (const p of productos) {
      const categoria = p.category || "Sin categoría";
      productosPorCategoria[categoria] = (productosPorCategoria[categoria] || 0) + 1;
    }

    // 📤 Enviar respuesta
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
    return res.status(500).json({ message: "❌ Error al generar estadísticas" });
  }
};

module.exports = {
  getResumenEstadisticas
};
