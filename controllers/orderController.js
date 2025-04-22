// 📁 backend/controllers/orderController.js
import Order from '../models/Order.js'
import Product from '../models/Product.js'

/**
 * 🛒 Crear nuevo pedido (público)
 */
export const createOrder = async (req, res) => {
  try {
    const { items, total, nombreCliente, nota, email, telefono } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: '⚠️ El pedido debe contener al menos un producto.' })
    }

    if (!nombreCliente || typeof nombreCliente !== 'string' || nombreCliente.trim().length < 2) {
      return res.status(400).json({ ok: false, message: '⚠️ Nombre del cliente inválido.' })
    }

    const totalParsed = parseFloat(total)
    if (isNaN(totalParsed) || totalParsed <= 0) {
      return res.status(400).json({ ok: false, message: '⚠️ Total del pedido inválido.' })
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ ok: false, message: '⚠️ Correo electrónico inválido.' })
    }

    if (telefono && typeof telefono !== 'string') {
      return res.status(400).json({ ok: false, message: '⚠️ Teléfono inválido.' })
    }

    // 🔍 Validar stock por producto y talla
    for (const item of items) {
      const producto = await Product.findById(item.id)
      if (!producto) {
        return res.status(404).json({ ok: false, message: `❌ Producto no encontrado: ${item.nombre}` })
      }

      const variante = producto.variants.find(v => v.talla === item.talla?.toLowerCase())
      if (!variante) {
        return res.status(400).json({
          ok: false,
          message: `⚠️ Variante no disponible: ${item.nombre} - Talla ${item.talla}`
        })
      }

      if (item.cantidad > variante.stock) {
        return res.status(400).json({
          ok: false,
          message: `❌ Stock insuficiente para ${item.nombre} (Talla ${item.talla}). Máximo disponible: ${variante.stock}`
        })
      }
    }

    // ✅ Crear pedido
    const newOrder = new Order({
      items,
      total: totalParsed,
      nombreCliente: nombreCliente.trim(),
      email: email?.trim() || '',
      telefono: telefono?.trim() || '',
      nota: nota?.trim() || '',
      estado: 'pendiente'
    })

    await newOrder.save()

    // 📉 Descontar stock
    for (const item of items) {
      await Product.findOneAndUpdate(
        { _id: item.id, 'variants.talla': item.talla?.toLowerCase() },
        { $inc: { 'variants.$.stock': -item.cantidad } }
      )
    }

    return res.status(201).json({
      ok: true,
      message: '✅ Pedido creado exitosamente',
      data: newOrder
    })
  } catch (error) {
    console.error('❌ Error creando pedido:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al crear el pedido.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * 📋 Obtener todos los pedidos (admin)
 */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    return res.status(200).json({
      ok: true,
      message: '✅ Pedidos obtenidos correctamente',
      data: orders
    })
  } catch (error) {
    console.error('❌ Error al obtener pedidos:', error)
    return res.status(500).json({ ok: false, message: '❌ Error al obtener pedidos.' })
  }
}

/**
 * 🔄 Actualizar estado de un pedido (admin)
 */
export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    if (!estado || typeof estado !== 'string') {
      return res.status(400).json({ ok: false, message: '⚠️ Estado del pedido inválido.' })
    }

    const pedido = await Order.findById(id)
    if (!pedido) {
      return res.status(404).json({ ok: false, message: '❌ Pedido no encontrado.' })
    }

    pedido.estado = estado.trim().toLowerCase()
    await pedido.save()

    return res.status(200).json({
      ok: true,
      message: '✅ Estado del pedido actualizado',
      data: pedido
    })
  } catch (error) {
    console.error('❌ Error actualizando estado del pedido:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error al actualizar el estado del pedido.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

/**
 * 📊 Obtener estadísticas de pedidos (admin)
 */
export const getOrderStats = async (req, res) => {
  try {
    const pedidos = await Order.find()
    const hoy = new Date().setHours(0, 0, 0, 0)

    const resumen = {
      total: pedidos.length,
      pendiente: 0,
      en_proceso: 0,
      enviado: 0,
      cancelado: 0,
      hoy: 0,
      ventasTotales: 0
    }

    for (const p of pedidos) {
      const estado = (p.estado || 'pendiente').toLowerCase()
      if (resumen.hasOwnProperty(estado)) resumen[estado]++
      if (estado === 'enviado') resumen.ventasTotales += parseFloat(p.total || 0)

      const fechaPedido = new Date(p.createdAt).setHours(0, 0, 0, 0)
      if (fechaPedido === hoy) resumen.hoy++
    }

    resumen.ventasTotales = resumen.ventasTotales.toFixed(2)

    return res.status(200).json({
      ok: true,
      message: '✅ Resumen de estadísticas generado correctamente',
      data: resumen
    })
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de pedidos:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error al obtener estadísticas.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
