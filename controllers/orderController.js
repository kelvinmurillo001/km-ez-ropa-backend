const Order = require('../models/Order');

/**
 * 🛒 Crear nuevo pedido (público)
 * - Valida estructura básica
 * - Guarda pedido con estado "pendiente"
 */
const createOrder = async (req, res) => {
  try {
    console.log("📩 Pedido recibido en backend:", req.body);

    const { items, total, nombreCliente, nota, email, telefono } = req.body;

    // Validaciones básicas
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "⚠️ El pedido debe contener al menos un producto." });
    }

    if (!nombreCliente || typeof nombreCliente !== 'string' || nombreCliente.trim().length < 2) {
      return res.status(400).json({ message: "⚠️ Nombre del cliente inválido." });
    }

    const totalParsed = parseFloat(total);
    if (isNaN(totalParsed) || totalParsed <= 0) {
      return res.status(400).json({ message: "⚠️ Total del pedido inválido." });
    }

    // Validaciones opcionales
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "⚠️ Correo electrónico inválido." });
    }

    if (telefono && typeof telefono !== 'string') {
      return res.status(400).json({ message: "⚠️ Teléfono inválido." });
    }

    // Crear pedido
    const newOrder = new Order({
      items,
      total: totalParsed,
      nombreCliente: nombreCliente.trim(),
      email: email?.trim() || '',
      telefono: telefono?.trim() || '',
      nota: nota?.trim() || '',
      estado: 'pendiente'
    });

    await newOrder.save();
    res.status(201).json(newOrder);

  } catch (error) {
    console.error("❌ Error creando pedido:", error);
    res.status(500).json({
      message: "❌ Error interno al crear el pedido.",
      error: error.message,
    });
  }
};

/**
 * 📋 Obtener todos los pedidos (admin)
 */
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    res.status(500).json({ message: "❌ Error al obtener pedidos." });
  }
};

/**
 * 🔄 Actualizar estado de un pedido (admin)
 */
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || typeof estado !== 'string') {
      return res.status(400).json({ message: "⚠️ Estado del pedido inválido." });
    }

    const pedido = await Order.findById(id);
    if (!pedido) {
      return res.status(404).json({ message: "❌ Pedido no encontrado." });
    }

    pedido.estado = estado.trim().toLowerCase();
    await pedido.save();

    res.json({ message: "✅ Estado del pedido actualizado", pedido });

  } catch (error) {
    console.error("❌ Error actualizando estado del pedido:", error);
    res.status(500).json({ message: "❌ Error al actualizar el estado del pedido." });
  }
};

/**
 * 📊 Obtener resumen de estadísticas del dashboard (admin)
 */
const getOrderStats = async (req, res) => {
  try {
    const pedidos = await Order.find();

    const hoy = new Date().setHours(0, 0, 0, 0);
    let ventasTotales = 0;

    const resumen = {
      total: pedidos.length,
      pendiente: 0,
      en_proceso: 0,
      enviado: 0,
      cancelado: 0,
      hoy: 0,
      ventasTotales: 0,
      totalVisitas: 0, // si lo implementas
      totalProductos: 0, // lo puedes calcular desde otra colección
      productosDestacados: 0 // por ahora estático
    };

    pedidos.forEach(p => {
      const estado = (p.estado || "pendiente").toLowerCase();
      if (resumen.hasOwnProperty(estado)) resumen[estado]++;
      if (estado === "enviado") ventasTotales += parseFloat(p.total || 0);

      const fechaPedido = new Date(p.createdAt).setHours(0, 0, 0, 0);
      if (fechaPedido === hoy) resumen.hoy++;
    });

    resumen.ventasTotales = ventasTotales.toFixed(2);

    res.json(resumen);
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de pedidos:", error);
    res.status(500).json({ message: "❌ Error al obtener estadísticas." });
  }
};

module.exports = {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats
};
