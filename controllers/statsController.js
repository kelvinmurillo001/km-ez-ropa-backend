const Product = require("../models/Product");
const Order = require("../models/Order");
const fs = require("fs").promises;
const path = require("path");

const visitasPath = path.join(__dirname, "..", "data", "visitas.json");

/**
 * 📊 Obtiene resumen de estadísticas para el panel administrativo
 */
const getResumenEstadisticas = async (req, res) => {
  try {
    const productos = await Product.find();
    const pedidos = await Order.find();

    // 📁 Leer visitas desde JSON plano
    let visitas = 0;
    try {
      const raw = await fs.readFile(visitasPath, "utf-8");
      const json = JSON.parse(raw);
      if (typeof json.count === 'number' && json.count >= 0) {
        visitas = json.count;
      }
    } catch (err) {
      console.warn("⚠️ No se pudo leer visitas.json, usando visitas = 0");
    }

    // 🕛 Fecha de hoy a medianoche
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 📦 Procesamiento
    const totalProductos = productos.length;
    const productosDestacados = productos.filter(p => p.featured === true).length;

    const pedidosEnviados = pedidos.filter(p => p.estado === "enviado");
    const ventasTotales = pedidosEnviados.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);

    const pedidosHoy = pedidos.filter(p => {
      const creado = new Date(p.createdAt);
      return creado >= hoy && !isNaN(creado);
    }).length;

    const productosPorCategoria = {};
    for (const p of productos) {
      const categoria = p.category || "Sin categoría";
      productosPorCategoria[categoria] = (productosPorCategoria[categoria] || 0) + 1;
    }

    // 📤 Enviar respuesta al panel
    return res.json({
      totalProductos,
      productosDestacados,
      pedidosTotales: pedidos.length,
      pedidosHoy,
      totalVisitas: visitas,
      ventasTotales: ventasTotales.toFixed(2),
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
