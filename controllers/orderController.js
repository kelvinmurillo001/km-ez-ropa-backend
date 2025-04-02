const Order = require('../models/Order');

// ➕ Crear pedido
const createOrder = async (req, res) => {
  try {
    const { items, total, nombreCliente, nota } = req.body;
    if (!items || !nombreCliente || total === undefined) {
      return res.status(400).json({ message: "Faltan datos del pedido." });
    }

    const newOrder = await Order.create({
      items,
      total,
      nombreCliente,
      nota
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("❌ Error creando pedido:", error);
    res.status(500).json({ message: "Error interno" });
  }
};

// 📥 Obtener todos los pedidos
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos" });
  }
};

// 🔄 Actualizar estado
const actualizarEstadoPedido = async (req, res) => {
  try {
    const pedido = await Order.findById(req.params.id);
    if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });

    pedido.estado = req.body.estado || pedido.estado;
    await pedido.save();
    res.json({ message: "✅ Estado actualizado" });
  } catch (err) {
    res.status(500).json({ message: "Error actualizando estado" });
  }
};

// 📊 Obtener estadísticas de pedidos
const getOrderStats = async (req, res) => {
  try {
    const pedidos = await Order.find();

    const totalEnviados = pedidos
      .filter(p => p.estado === "enviado")
      .reduce((sum, p) => sum + p.total, 0);

    res.json({ ventasTotales: totalEnviados });
  } catch (err) {
    res.status(500).json({ message: "Error obteniendo estadísticas" });
  }
};

module.exports = {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats
};
