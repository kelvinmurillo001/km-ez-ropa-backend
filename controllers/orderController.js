// 📁 backend/controllers/orderController.js
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

    // 🔄 Actualizar stock por variante
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

    // 📩 Notificación al cliente
    await sendNotification({
      nombreCliente: newOrder.nombreCliente,
      telefono: newOrder.telefono,
      email: newOrder.email,
      estadoActual: newOrder.estado,
      tipo: 'creacion'
    });

    // 🔔 Emitir notificación en tiempo real
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

    // 🔔 Emitir notificación WebSocket si cliente está conectado
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
