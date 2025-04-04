const Order = require('../models/Order');

// ➕ Crear pedido
const createOrder = async (req, res) => {
  try {
    const { items, total, nombreCliente, nota } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "El pedido debe contener al menos un producto." });
    }

    if (!nombreCliente || typeof nombreCliente !== 'string') {
      return res.status(400).json({ message: "Nombre del cliente inválido." });
    }

    if (total === undefined || isNaN(total)) {
      return res.status(400).json({ message: "Total inválido." });
    }

    const newOrder = await Order.create({
      items,
      total,
      nombreCliente: nombreCliente.trim(),
      nota: nota?.trim() || '',
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("❌ Error creando pedido:", error);
    res.status(500).json({ message: "Error interno al crear el pedido." });
  }
};

// 📥 Obtener todos los pedidos (solo admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

// 🔄 Actualizar estado del pedido
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const pedido = await Order.findById(id);
    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    if (!estado || typeof estado !== 'string') {
      return res.status(400).json({ message: "Estado inválido" });
    }

    pedido.estado = estado;
    await pedido.save();

    res.json({ message: "✅ Estado actualizado", pedido });
  } catch (err) {
    console.error("❌ Error actualizando estado:", err);
    res.status(500).json({ message: "Error actualizando estado del pedido" });
  }
};

// 📊 Obtener estadísticas de ventas
const getOrderStats = async (req, res) => {
  try {
    const pedidos = await Order.find({ estado: "enviado" });

    const totalEnviados = pedidos.reduce((sum, p) => sum + p.total, 0);

    res.json({ ventasTotales: totalEnviados });
  } catch (err) {
    console.error("❌ Error obteniendo estadísticas:", err);
    res.status(500).json({ message: "Error obteniendo estadísticas de pedidos" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats
};
