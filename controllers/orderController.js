const Order = require('../models/Order');

// 🛒 Crear nuevo pedido (público)
const createOrder = async (req, res) => {
  try {
    const { items, total, nombreCliente, nota } = req.body;

    // Validaciones básicas
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "El pedido debe contener al menos un producto." });
    }

    if (!nombreCliente || typeof nombreCliente !== 'string') {
      return res.status(400).json({ message: "Nombre del cliente inválido." });
    }

    if (total === undefined || isNaN(total)) {
      return res.status(400).json({ message: "Total inválido." });
    }

    // Crear pedido
    const newOrder = new Order({
      items,
      total,
      nombreCliente: nombreCliente.trim(),
      nota: nota?.trim() || '',
      estado: 'pendiente'
    });

    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("❌ Error creando pedido:", error);
    res.status(500).json({ message: "Error interno al crear el pedido." });
  }
};

// 📋 Obtener todos los pedidos (admin)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error);
    res.status(500).json({ message: "Error al obtener pedidos." });
  }
};

// 🔄 Actualizar estado del pedido (admin)
const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const pedido = await Order.findById(id);
    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    if (!estado || typeof estado !== 'string') {
      return res.status(400).json({ message: "Estado inválido." });
    }

    pedido.estado = estado;
    await pedido.save();

    res.json({ message: "✅ Estado actualizado", pedido });
  } catch (error) {
    console.error("❌ Error actualizando estado:", error);
    res.status(500).json({ message: "Error al actualizar el estado del pedido." });
  }
};

// 📊 Estadísticas de pedidos enviados (admin)
const getOrderStats = async (req, res) => {
  try {
    const pedidos = await Order.find({ estado: "enviado" });
    const totalEnviados = pedidos.reduce((sum, p) => sum + p.total, 0);

    res.json({ ventasTotales: totalEnviados });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas de pedidos." });
  }
};

module.exports = {
  createOrder,
  getOrders,
  actualizarEstadoPedido,
  getOrderStats
};
