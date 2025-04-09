// controllers/statsController.js

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

    // 📁 Leer visitas del archivo JSON
    let visitas = 0;
    try {
      const raw = await fs.readFile(visitasPath, "utf-8");
      const json = JSON.parse(raw);
      visitas = json?.count || 0;
    } catch (err) {
      console.warn("⚠️ No se pudo leer visitas.json, usando visitas = 0");
    }

    // 📅 Fecha actual a medianoche
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 📦 Estadísticas
    const totalProductos = productos.length;
    const productosDestacados = productos.filter(p => p.featured).length;

    const ventasTotales = pedidos
      .filter(p => p.estado === "enviado")
      .reduce((acc, p) => acc + parseFloat(p.total || 0), 0);

    const pedidosHoy = pedidos.filter(p => {
      const creado = new Date(p.createdAt);
      return !isNaN(creado) && creado >= hoy;
    }).length;

    const productosPorCategoria = {};
    productos.forEach(p => {
      const cat = p.category || "Sin categoría";
      productosPorCategoria[cat] = (productosPorCategoria[cat] || 0) + 1;
    });

    // 📤 Enviar respuesta
    res.json({
      totalProductos,
      productosDestacados,
      totalVisitas: visitas,
      ventasTotales: ventasTotales.toFixed(2),
      pedidosTotales: pedidos.length,
      pedidosHoy,
      productosPorCategoria
    });

  } catch (err) {
    console.error("❌ Error al obtener estadísticas:", err);
    res.status(500).json({ message: "Error al generar estadísticas" });
  }
};

module.exports = {
  getResumenEstadisticas
};
