import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { sendNotification } from '../utils/notifications.js'
import crypto from 'crypto'

/**
 * 🛒 Crear nuevo pedido (público)
 */
export const createOrder = async (req, res) => {
  try {
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

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
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
      factura: {
        razonSocial: factura?.razonSocial?.trim() || '',
        ruc: factura?.ruc?.trim() || '',
        email: factura?.email?.trim()?.toLowerCase() || ''
      },
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

      // Si se agota el stock, desactiva la variante
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
    console.error('❌ Error creando pedido:', error)
    return res.status(500).json({ ok: false, message: '❌ Error interno creando el pedido.', error: error.message })
  }
}
