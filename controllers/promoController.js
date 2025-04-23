// 📁 backend/controllers/promoController.js
import Promotion from '../models/promotion.js'

/**
 * 📥 Obtener promociones activas y vigentes (públicas)
 */
export const getPromotion = async (req, res) => {
  try {
    const now = new Date()

    const activePromos = await Promotion.find({
      active: true,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        { startDate: null, endDate: null },
        { startDate: { $lte: now }, endDate: null },
        { startDate: null, endDate: { $gte: now } }
      ]
    }).sort({ createdAt: -1 })

    return res.status(200).json({
      ok: true,
      message: '✅ Promociones activas cargadas',
      data: activePromos
    })
  } catch (error) {
    console.error('❌ Error al obtener promociones:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error al obtener promociones activas',
      error: error.message
    })
  }
}

/**
 * 📋 Obtener todas las promociones (admin)
 */
export const getAllPromotions = async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 })
    return res.status(200).json({
      ok: true,
      message: '✅ Todas las promociones cargadas',
      data: promos
    })
  } catch (error) {
    console.error('❌ Error al obtener todas las promociones:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al cargar promociones',
      error: error.message
    })
  }
}

/**
 * 💾 Crear o actualizar una promoción
 */
export const updatePromotion = async (req, res) => {
  try {
    const {
      message,
      active = false,
      theme = 'blue',
      startDate,
      endDate,
      mediaUrl = null,
      mediaType = null,
      pages = [],
      position = 'top'
    } = req.body

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ El mensaje debe tener al menos 3 caracteres'
      })
    }

    const allowedPages = ['home', 'categorias', 'productos', 'checkout', 'detalle', 'carrito']
    const lowerPages = Array.isArray(pages) ? pages.map(p => p.toLowerCase()) : []

    if (!Array.isArray(pages) || lowerPages.some(p => !allowedPages.includes(p))) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Página inválida en el array pages[]'
      })
    }

    if (mediaType && !['image', 'video'].includes(mediaType.toLowerCase())) {
      return res.status(400).json({
        ok: false,
        message: "⚠️ mediaType debe ser 'image' o 'video'"
      })
    }

    const parsedStart = startDate ? new Date(startDate) : null
    const parsedEnd = endDate ? new Date(endDate) : null

    if (parsedStart && isNaN(parsedStart.getTime())) {
      return res.status(400).json({ ok: false, message: '⚠️ Fecha de inicio inválida' })
    }

    if (parsedEnd && isNaN(parsedEnd.getTime())) {
      return res.status(400).json({ ok: false, message: '⚠️ Fecha de fin inválida' })
    }

    const promo = new Promotion({
      message: message.trim(),
      active: Boolean(active),
      theme: theme.toLowerCase(),
      startDate: parsedStart,
      endDate: parsedEnd,
      mediaUrl,
      mediaType: mediaType?.toLowerCase() || null,
      pages: lowerPages,
      position: position.toLowerCase(),
      createdBy: req.user?.username || 'admin'
    })

    await promo.save()

    return res.status(201).json({
      ok: true,
      message: '✅ Promoción creada correctamente',
      data: promo
    })
  } catch (error) {
    console.error('❌ Error al guardar promoción:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al guardar promoción',
      error: error.message
    })
  }
}

/**
 * 🔁 Activar o desactivar promoción
 */
export const togglePromoActive = async (req, res) => {
  try {
    const { id } = req.params
    const promo = await Promotion.findById(id)

    if (!promo) {
      return res.status(404).json({ ok: false, message: '❌ Promoción no encontrada' })
    }

    promo.active = !promo.active
    await promo.save()

    return res.status(200).json({
      ok: true,
      message: `✅ Promoción ${promo.active ? 'activada' : 'desactivada'}`,
      data: promo
    })
  } catch (error) {
    console.error('❌ Error cambiando estado de promoción:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al actualizar promoción',
      error: error.message
    })
  }
}

/**
 * 🗑️ Eliminar promoción
 */
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params
    const promo = await Promotion.findByIdAndDelete(id)

    if (!promo) {
      return res.status(404).json({ ok: false, message: '❌ Promoción no encontrada' })
    }

    return res.status(200).json({
      ok: true,
      message: '🗑️ Promoción eliminada correctamente'
    })
  } catch (error) {
    console.error('❌ Error al eliminar promoción:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar promoción',
      error: error.message
    })
  }
}
