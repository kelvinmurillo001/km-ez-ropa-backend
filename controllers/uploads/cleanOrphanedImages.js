const Product = require('../../models/Product')
const { cloudinary } = require('../../config/cloudinary')

/**
 * 🧹 Limpia imágenes huérfanas de Cloudinary
 * - Compara los cloudinaryId usados en la DB vs los existentes en Cloudinary
 * - Solo debería usarse por el administrador
 */
const cleanOrphanedImages = async (req, res) => {
  try {
    const usedIds = new Set()

    // 📦 Obtener productos y recoger sus cloudinaryIds
    const productos = await Product.find()
    for (const p of productos) {
      ;(p.images || []).forEach(img => {
        if (img.cloudinaryId) usedIds.add(img.cloudinaryId)
      })
      ;(p.variants || []).forEach(v => {
        if (v.cloudinaryId) usedIds.add(v.cloudinaryId)
      })
    }

    // 🧠 Cloudinary tiene un límite de 100 por búsqueda. Considerar paginación futura.
    const result = await cloudinary.search
      .expression('folder:productos_kmezropa')
      .max_results(100)
      .execute()

    const huérfanas = result.resources.filter(img => !usedIds.has(img.public_id))
    const eliminadas = []
    const fallidas = []

    for (const img of huérfanas) {
      try {
        await cloudinary.uploader.destroy(img.public_id)
        eliminadas.push(img.public_id)
      } catch (err) {
        console.warn(`⚠️ Error al eliminar imagen huérfana (${img.public_id}):`, err.message)
        fallidas.push({ public_id: img.public_id, error: err.message })
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🧼 Total imágenes en Cloudinary: ${result.resources.length}`)
      console.log(`🔍 Huérfanas encontradas: ${huérfanas.length}`)
      console.log(`✅ Eliminadas: ${eliminadas.length}`)
    }

    return res.status(200).json({
      ok: true,
      message: '🧹 Limpieza de imágenes huérfanas completada',
      data: {
        totalEnCloudinary: result.resources.length,
        totalUsadasEnDB: usedIds.size,
        totalHuérfanas: huérfanas.length,
        totalEliminadas: eliminadas.length,
        eliminadas,
        errores: fallidas.length ? fallidas : undefined
      }
    })
  } catch (error) {
    console.error('❌ Error limpiando imágenes huérfanas:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error al limpiar imágenes huérfanas',
      error: error.message
    })
  }
}

module.exports = { cleanOrphanedImages }
