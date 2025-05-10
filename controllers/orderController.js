// 📁 backend/controllers/orderController.js
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendNotification } from '../utils/notifications.js';
import {
  checkVariantDisponible,
  verificarProductoAgotado
} from '../utils/checkProductAvailability.js';
import config from '../config/configuracionesito.js';
import { validationResult } from 'express-validator';

/* 🛒 CREAR PEDIDO (PÚBLICO) */
export const createOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }

  try {
    const {
      items,
      total,
      nombreCliente,
      nota = '',
      email,
      telefono,
      direccion,
      metodoPago = 'efectivo',
      factura = {}
    } = req.body;

    // 🧪 Validaciones básicas
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: '⚠️ El pedido debe contener al menos un producto.' });
    }

    if (!nombreCliente || nombreCliente.trim().length < 2) {
      return res.status(400).json({ ok: false, message: '⚠️ Nombre de cliente inválido.' });
    }

    const totalNum = parseFloat(total);
    if (isNaN(totalNum) || totalNum <= 0) {
      return res.status(400).json({ ok: false, message: '⚠️ Total inválido.' });
    }

    const correoValido = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!correoValido.test(email)) {
      return res.status(400).json({ ok: false, message: '⚠️ Email inválido.' });
    }

    if (!telefono || telefono.trim().length < 6) {
      return res.status(400).json({ ok: false, message: '⚠️ Teléfono inválido.' });
    }

    // 🔍 Verificar stock de cada item
    for (const item of items) {
      const { productId, talla, color, cantidad } = item;
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ ok: false, message: `⚠️ ID de producto inválido: ${productId}` });
      }

      const producto = await Product.findById(productId).select('variants').lean();
      if (!producto) {
        return res.status(404).json({ ok: false, message: `❌ Producto no encontrado: ${productId}` });
      }

      const disponibilidad = checkVariantDisponible(producto.variants, talla, color, cantidad);
      if (!disponibilidad.ok) {
        return res.status(400).json({ ok: false, message: disponibilidad.message });
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

    // ⬇️ Actualizar stock por item
    await Promise.all(items.map(async ({ productId, talla, color, cantidad }) => {
      const updated = await Product.findOneAndUpdate(
        { _id: productId, 'variants.talla': talla.toLowerCase(), 'variants.color': color.toLowerCase() },
        { $inc: { 'variants.$.stock': -cantidad } },
        { new: true }
      );

      if (updated) {
        const variant = updated.variants.find(v => v.talla === talla.toLowerCase() && v.color === color.toLowerCase());
        if (variant && variant.stock <= 0) variant.activo = false;
        updated.isActive = !verificarProductoAgotado(updated.variants);
        await updated.save();
      }
    }));

    // ✉️ Notificar
    await sendNotification({
      nombreCliente: newOrder.nombreCliente,
      telefono: newOrder.telefono,
      email: newOrder.email,
      estadoActual: newOrder.estado,
      tipo: 'creacion'
    });

    return res.status(201).json({ ok: true, data: newOrder });
  } catch (err) {
    console.error('❌ Error creando pedido:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al crear pedido',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

/* 📋 LISTADO GENERAL DE PEDIDOS */
export const getOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ ok: true, data: orders });
  } catch (err) {
    console.error('❌ Error obteniendo pedidos:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener pedidos',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

/* 📦 PEDIDOS DEL CLIENTE ACTUAL */
export const getMyOrders = async (req, res) => {
  try {
    const userEmail = req.user?.email?.toLowerCase();
    if (!userEmail) {
      return res.status(401).json({ ok: false, message: '❌ Usuario no autenticado correctamente.' });
    }

    const pedidos = await Order.find({ email: userEmail }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ ok: true, pedidos });
  } catch (err) {
    console.error('❌ Error obteniendo pedidos del usuario:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener tus pedidos.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

/* 🔄 CAMBIAR ESTADO DE PEDIDO */
export const actualizarEstadoPedido = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    const { estado } = req.body;
    const validStates = ['pendiente', 'en_proceso', 'enviado', 'cancelado', 'pagado'];

    if (!validStates.includes(estado)) {
      return res.status(400).json({ ok: false, message: '⚠️ Estado no válido.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de pedido inválido.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ ok: false, message: '❌ Pedido no encontrado.' });
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

    return res.status(200).json({ ok: true, data: order });
  } catch (err) {
    console.error('❌ Error actualizando estado:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al actualizar estado',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

/* 📊 RESUMEN DE PEDIDOS */
export const getOrderStats = async (_req, res) => {
  try {
    const orders = await Order.find().lean();
    const today = new Date().setHours(0, 0, 0, 0);
    const summary = {
      total: 0, pendiente: 0, en_proceso: 0, enviado: 0, cancelado: 0, hoy: 0, ventasTotales: 0
    };

    orders.forEach(o => {
      summary.total++;
      const state = (o.estado || 'pendiente').toLowerCase();
      if (summary[state] !== undefined) summary[state]++;
      if (state === 'enviado') summary.ventasTotales += parseFloat(o.total || 0);
      if (new Date(o.createdAt).setHours(0, 0, 0, 0) === today) summary.hoy++;
    });

    summary.ventasTotales = Number(summary.ventasTotales.toFixed(2));
    return res.status(200).json({ ok: true, data: summary });
  } catch (err) {
    console.error('❌ Error generando estadísticas:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al generar estadísticas',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

/* 🔍 SEGUIMIENTO DE PEDIDO */
export const trackOrder = async (req, res) => {
  try {
    const codigo = String(req.params.codigo || '').trim();
    if (!codigo) {
      return res.status(400).json({ ok: false, message: '⚠️ Código de seguimiento requerido.' });
    }

    const order = await Order.findOne({ codigoSeguimiento: codigo }).lean();
    if (!order) {
      return res.status(404).json({ ok: false, message: '❌ Pedido no encontrado.' });
    }

    return res.status(200).json({
      ok: true,
      data: {
        nombre: order.nombreCliente,
        direccion: order.direccion,
        metodoPago: order.metodoPago,
        total: order.total,
        estadoActual: order.estado
      }
    });
  } catch (err) {
    console.error('❌ Error en seguimiento:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno en seguimiento',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};

/* 🗑️ ELIMINAR PEDIDO */
export const deleteOrder = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de pedido inválido.' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ ok: false, message: '❌ Pedido no encontrado.' });
    }

    await Order.deleteOne({ _id: id });

    return res.status(200).json({ ok: true, data: { deletedId: id } });
  } catch (err) {
    console.error('❌ Error eliminando pedido:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar pedido',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};
