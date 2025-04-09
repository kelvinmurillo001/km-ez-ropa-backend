// controllers/statsController.js

const Product = require("../models/Product");
const Order = require("../models/Order");
const fs = require("fs").promises;
const path = require("path");

const visitasPath = path.join(__dirname, "..", "data", "visitas.json");

/**
 * 📊 Obtiene resumen de estadísticas
 * - Total de productos
 * - Productos destacados
 * - Ventas totales
 * - Visitas desde archivo local
 */
const getResumenEstadisticas = async (req, res) => {
  try {
    const productos = await Product.find();
    const pedidos = await Order.find({ estado: "enviado" });

    // Cargar visitas desde archivo local
    let visitas = 0;
    try {
      const raw = await fs.readFile(visitasPath, "utf-8");
      const json = JSON.parse(raw);
      visitas = json?.count || 0;
    } catch (err) {
      console.warn("⚠️ No se pudo leer visitas.json, usando visitas = 0");
    }

    // Calcular estadísticas
    const totalProductos = productos.length;
    const productosDestacados = productos.filter(p => p.featured).length;
    const ventasTotales = pedidos.reduce((acc, p) => acc + parseFloat(p.total || 0), 0);

    res.json({
      totalProductos,
      productosDestacados,
      totalVisitas: visitas,
      ventasTotales: ventasTotales.toFixed(2)
    });

  } catch (err) {
    console.error("❌ Error al obtener estadísticas:", err);
    res.status(500).json({ message: "Error al generar estadísticas" });
  }
};

// ✅ Exportar correctamente
module.exports = {
  getResumenEstadisticas
};
