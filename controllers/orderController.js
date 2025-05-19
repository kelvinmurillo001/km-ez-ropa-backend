import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import config from '../config/configuracionesito.js';
import { validationResult } from 'express-validator';
import { sendNotification } from '../utils/notifications.js';
import { checkVariantDisponible, verificarProductoAgotado } from '../utils/checkProductAvailability.js';
import { enviarError, enviarExito } from '../utils/admin-auth-utils.js';

/* 🍎 CREAR PEDIDO */
export const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('❌ Validaciones fallidas en pedido:', errors.array());
    return enviarError(res, '❌ Validaciones fallidas.', 400);
  }

  try {
    const {
      items,
      total,
      nombreCliente,
      nota = '',
      email,
      telefono,
      direccion = '',
      metodoPago = 'efectivo',
      factura = {}
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return enviarError(res, '⚠️ El pedido debe contener al menos un producto.', 400);
    }

    if (!nombreCliente?.trim() || nombreCliente.trim().length < 2) {
      return enviarError(res, '⚠️ Nombre de cliente inválido.', 400);
    }

    const totalNum = parseFloat(total);
    if (isNaN(totalNum) || totalNum <= 0) {
      return enviarError(res, '⚠️ Total inválido.', 400);
    }

    const correoValido = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!correoValido.test(email)) {
      return enviarError(res, '⚠️ Email inválido.', 400);
    }

    if (!telefono || telefono.trim().length < 6) {
      return enviarError(res, '⚠️ Teléfono inválido.', 400);
    }

    for (const item of items) {
      const { productId, talla, color, cantidad } = item;

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return enviarError(res, `⚠️ ID de producto inválido: ${productId}`, 400);
      }

      const producto = await Product.findById(productId).select('variants').lean();
      if (!producto) {
        return enviarError(res, `❌ Producto no encontrado: ${productId}`, 404);
      }

      const disponibilidad = checkVariantDisponible(producto.variants, talla, color, cantidad);
      if (!disponibilidad.ok) {
        return enviarError(res, disponibilidad.message, 400);
      }
    }

    const newOrder = await Order.create({
      items,
      total: totalNum,
      nombreCliente: nombreCliente.trim(),
      email: email.trim().toLowerCase(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      metodoPago: metodoPago.trim().toLowerCase(),
      nota: nota.trim(),
      factura,
      estado: metodoPago.toLowerCase() === 'transferencia' ? 'pendiente' : 'pagado'
    });

    await Promise.all(items.map(async ({ productId, talla, color, cantidad }) => {
      const updated = await Product.findOneAndUpdate(
        { _id: productId, 'variants.talla': talla.toLowerCase(), 'variants.color': color.toLowerCase() },
        { $inc: { 'variants.$.stock': -cantidad } },
        { new: true }
      );

      if (updated) {
        const variant = updated.variants.find(v =>
          v.talla === talla.toLowerCase() && v.color === color.toLowerCase()
        );

        if (variant && variant.stock <= 0) variant.activo = false;
        updated.isActive = !verificarProductoAgotado(updated.variants);
        await updated.save();
      }
    }));

    await sendNotification({
      nombreCliente: newOrder.nombreCliente,
      telefono: newOrder.telefono,
      email: newOrder.email,
      estadoActual: newOrder.estado,
      tipo: 'creacion'
    });

    if (global.io && typeof global.io.emit === 'function') {
      global.io.emit('cliente:estadoPedido', {
        email: newOrder.email,
        estado: newOrder.estado,
        mensaje: `📦 Tu pedido fue registrado y está en estado: ${newOrder.estado.toUpperCase()}`
      });
    }

    return enviarExito(res, newOrder, '✅ Pedido creado exitosamente');
  } catch (err) {
    console.error('❌ Error creando pedido:', err);
    return enviarError(res, '❌ Error interno al crear pedido', 500);
  }
};

/* 🔄 ACTUALIZAR ESTADO DE PEDIDO */
export const actualizarEstadoPedido = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const { estado } = req.body;
    const validStates = ['pendiente', 'en_proceso', 'enviado', 'cancelado', 'pagado'];

    if (!validStates.includes(estado)) {
      return enviarError(res, '⚠️ Estado no válido.', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return enviarError(res, '⚠️ ID de pedido inválido.', 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      return enviarError(res, '❌ Pedido no encontrado.', 404);
    }

    order.estado = estado;
    await order.save();

    await sendNotification({
      nombreCliente: order.nombreCliente,
      telefono: order.telefono,
      email: order.email,
      estadoActual: order.estado,
      tipo: 'estado'
    });

    if (global.io && typeof global.io.emit === 'function') {
      global.io.emit('cliente:estadoPedido', {
        email: order.email,
        estado: order.estado,
        mensaje: `📦 Tu pedido ahora está en estado: ${order.estado.toUpperCase()}`
      });
    }

    return enviarExito(res, order, '✅ Estado actualizado');
  } catch (err) {
    console.error('❌ Error actualizando estado:', err);
    return enviarError(res, '❌ Error interno al actualizar estado', 500);
  }
};

/* 🗑️ ELIMINAR PEDIDO */
export const deleteOrder = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return enviarError(res, '⚠️ ID de pedido inválido.', 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      return enviarError(res, '❌ Pedido no encontrado.', 404);
    }

    await Order.deleteOne({ _id: id });
    return enviarExito(res, { deletedId: id }, '✅ Pedido eliminado');
  } catch (err) {
    console.error('❌ Error eliminando pedido:', err);
    return enviarError(res, '❌ Error interno al eliminar pedido', 500);
  }
};

/* 📋 OBTENER TODOS LOS PEDIDOS */
export const getOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return enviarExito(res, orders);
  } catch (err) {
    console.error('❌ Error obteniendo pedidos:', err);
    return enviarError(res, '❌ Error interno al obtener pedidos', 500);
  }
};

/* 📦 PEDIDOS DEL CLIENTE AUTENTICADO */
export const getMyOrders = async (req, res) => {
  try {
    const userEmail = req.user?.email?.toLowerCase();
    if (!userEmail) {
      return enviarError(res, '❌ Usuario no autenticado correctamente.', 401);
    }

    const pedidos = await Order.find({ email: userEmail }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ ok: true, pedidos });
  } catch (err) {
    console.error('❌ Error obteniendo pedidos del usuario:', err);
    return enviarError(res, '❌ Error interno al obtener tus pedidos.', 500);
  }
};

/* 📊 ESTADÍSTICAS DE PEDIDOS */
export const getOrderStats = async (_req, res) => {
  try {
    const orders = await Order.find().lean();
    const today = new Date().setHours(0, 0, 0, 0);

    const summary = {
      total: 0,
      pendiente: 0,
      en_proceso: 0,
      enviado: 0,
      cancelado: 0,
      hoy: 0,
      ventasTotales: 0
    };

    orders.forEach(o => {
      summary.total++;
      const estado = (o.estado || 'pendiente').toLowerCase();
      if (summary[estado] !== undefined) summary[estado]++;
      if (estado === 'enviado') summary.ventasTotales += parseFloat(o.total || 0);
      if (new Date(o.createdAt).setHours(0, 0, 0, 0) === today) summary.hoy++;
    });

    summary.ventasTotales = Number(summary.ventasTotales.toFixed(2));
    return enviarExito(res, summary);
  } catch (err) {
    console.error('❌ Error generando estadísticas:', err);
    return enviarError(res, '❌ Error interno al generar estadísticas', 500);
  }
};

/* 🔍 SEGUIMIENTO DE PEDIDO */
export const trackOrder = async (req, res) => {
  try {
    const codigo = String(req.params.codigo || '').trim();
    if (!codigo) {
      return enviarError(res, '⚠️ Código de seguimiento requerido.', 400);
    }

    const order = await Order.findOne({ codigoSeguimiento: codigo }).lean();
    if (!order) {
      return enviarError(res, '❌ Pedido no encontrado.', 404);
    }

    return enviarExito(res, {
      nombre: order.nombreCliente,
      direccion: order.direccion,
      metodoPago: order.metodoPago,
      total: order.total,
      estadoActual: order.estado
    });
  } catch (err) {
    console.error('❌ Error en seguimiento:', err);
    return enviarError(res, '❌ Error interno en seguimiento', 500);
  }
};

/* ✅ EXPORTAR TODOS */
export {
  createOrder,
  actualizarEstadoPedido,
  deleteOrder,
  getOrders,
  getMyOrders,
  getOrderStats,
  trackOrder
};
