import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { sendNotification } from '../utils/notifications.js'
import crypto from 'crypto'

/**
 * 🛒 Crear nuevo pedido (público)
 */
export const createOrder = async (req, res) => {
  try {
    console.log("📦 Datos recibidos en createOrder:");
    console.dir(req.body, { depth: null });

    const {
      items,
      total,
      nombreCliente,
      nota,
      email,
      telefono,
      direccion,
      metodoPago,
      factura
    } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: '⚠️ El pedido debe contener al menos un producto.' })
    }

    if (!nombreCliente || nombreCliente.trim().length < 2) {
      return res.status(400).json({ ok: false, message: '⚠️ Nombre de cliente inválido.' })
    }

    const totalParsed = parseFloat(total)
    if (isNaN(totalParsed) || totalParsed <= 0) {
      return res.status(400).json({ ok: false, message: '⚠️ Total inválido.' })
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ ok: false, message: '⚠️ Email inválido.' })
    }

    if (!telefono || typeof telefono !== 'string' || telefono.trim().length < 6) {
      return res.status(400).json({ ok: false, message: '⚠️ Teléfono inválido.' })
    }

    // Validar productos y stock
    for (const item of items) {
      if (!item.talla) {
        return res.status(400).json({ ok: false, message: `⚠️ Talla requerida en producto: ${item.name}` })
      }

      const producto = await Product.findById(item.productId)
      if (!producto) {
        return res.status(404).json({ ok: false, message: `❌ Producto no encontrado: ${item.name}` })
      }

      const variante = producto.variants.find(v => v.talla === item.talla.toLowerCase())
      if (!variante || !variante.activo) {
        return res.status(400).json({ ok: false, message: `❌ Variante no disponible: ${item.name} - ${item.talla}` })
      }

      if (item.cantidad > variante.stock) {
        return res.status(400).json({ ok: false, message: `❌ Stock insuficiente para ${item.name}` })
      }
    }

    // Generar código único de seguimiento
    const codigoSeguimiento = crypto.randomBytes(6).toString('hex').toUpperCase()

    const newOrder = new Order({
      items,
      total: totalParsed,
      nombreCliente: nombreCliente.trim(),
      email: email?.trim() || '',
      telefono: telefono?.trim() || '',
      direccion: direccion?.trim() || '',
      metodoPago: metodoPago?.trim().toLowerCase() || 'efectivo',
      nota: nota?.trim() || '',
      factura: typeof factura === 'object' ? factura : {},
      estado: metodoPago?.toLowerCase() === 'transferencia' ? 'pendiente' : 'pagado',
      codigoSeguimiento
    })

    await newOrder.save()

    // Actualizar stock por variante
    for (const item of items) {
      const producto = await Product.findOneAndUpdate(
        { _id: item.productId, 'variants.talla': item.talla.toLowerCase() },
        { $inc: { 'variants.$.stock': -item.cantidad } },
        { new: true }
      )

      if (producto) {
        const variante = producto.variants.find(v => v.talla === item.talla.toLowerCase())
        if (variante && variante.stock <= 0) {
          variante.activo = false
          producto.markModified('variants')
          await producto.save()
        }
      }
    }

    console.log(`🛒 Pedido creado: ${nombreCliente} | Total: $${totalParsed.toFixed(2)} | Código: ${codigoSeguimiento}`)

    return res.status(201).json({
      ok: true,
      message: '✅ Pedido creado exitosamente',
      data: newOrder
    })
  } catch (error) {
    console.error("❌ Error creando pedido:", error);
    console.error("❌ Stack trace:", error.stack);
    return res.status(500).json({ ok: false, message: '❌ Error interno creando el pedido.', error: error.message })
  }
}

/**
 * 📋 Obtener todos los pedidos (admin)
 */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    return res.status(200).json({ ok: true, message: '✅ Pedidos cargados correctamente', data: orders })
  } catch (error) {
    return res.status(500).json({ ok: false, message: '❌ Error obteniendo pedidos.', error: error.message })
  }
}

/**
 * 🔄 Actualizar estado de un pedido (admin)
 */
export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body
    const estadosValidos = ['pendiente', 'en_proceso', 'enviado', 'cancelado']

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ ok: false, message: '⚠️ Estado no válido.' })
    }

    const pedido = await Order.findById(id)
    if (!pedido) {
      return res.status(404).json({ ok: false, message: '❌ Pedido no encontrado.' })
    }

    pedido.estado = estado
    await pedido.save()

    await sendNotification({
      nombreCliente: pedido.nombreCliente,
      telefono: pedido.telefono,
      email: pedido.email,
      estadoActual: pedido.estado
    })

    return res.status(200).json({ ok: true, message: '✅ Estado actualizado', data: pedido })
  } catch (error) {
    return res.status(500).json({ ok: false, message: '❌ Error actualizando estado.', error: error.message })
  }
}

/**
 * 📈 Obtener estadísticas de pedidos
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
      const estado = p.estado || 'pendiente'
      if (resumen[estado] !== undefined) resumen[estado]++
      if (estado === 'enviado') resumen.ventasTotales += parseFloat(p.total || 0)

      const fecha = new Date(p.createdAt).setHours(0, 0, 0, 0)
      if (fecha === hoy) resumen.hoy++
    }

    resumen.ventasTotales = Number(resumen.ventasTotales.toFixed(2))

    return res.status(200).json({ ok: true, message: '✅ Estadísticas generadas', data: resumen })
  } catch (error) {
    return res.status(500).json({ ok: false, message: '❌ Error generando estadísticas.', error: error.message })
  }
}

/**
 * 🔎 Seguimiento de pedido (público)
 */
export const trackOrder = async (req, res) => {
  try {
    const { codigo } = req.params
    const pedido = await Order.findOne({ codigoSeguimiento: codigo })

    if (!pedido) {
      return res.status(404).json({ ok: false, message: '❌ Pedido no encontrado.' })
    }

    return res.status(200).json({
      ok: true,
      message: '✅ Pedido encontrado',
      estadoActual: pedido.estado,
      resumen: {
        nombre: pedido.nombreCliente,
        direccion: pedido.direccion,
        metodoPago: pedido.metodoPago,
        total: pedido.total
      }
    })
  } catch (error) {
    return res.status(500).json({ ok: false, message: '❌ Error buscando pedido.', error: error.message })
  }
}

/**
 * 🗑️ Eliminar pedido (admin)
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params

    const pedido = await Order.findById(id)
    if (!pedido) {
      return res.status(404).json({ ok: false, message: '❌ Pedido no encontrado.' })
    }

    await Order.findByIdAndDelete(id)

    return res.status(200).json({
      ok: true,
      message: '✅ Pedido eliminado correctamente.',
      idEliminado: id
    })
  } catch (error) {
    console.error('❌ Error eliminando pedido:', error)
    return res.status(500).json({ ok: false, message: '❌ Error eliminando pedido.', error: error.message })
  }
}
