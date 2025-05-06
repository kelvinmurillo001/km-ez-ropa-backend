// 📁 backend/controllers/uploads/cleanOrphanedImages.js
import Product from '../../models/Product.js'
import { cloudinary } from '../../config/cloudinary.js'

/**
 * 🧹 Limpia imágenes huérfanas de Cloudinary
 * @route   DELETE /api/uploads/clean
 * @access  Admin
 */
export const cleanOrphanedImages = async (req, res) => {
  try {
    // 1️⃣ Recolectar todos los IDs usados en DB
    const productos = await Product.find().select('images.cloudinaryId variants.cloudinaryId').lean()

    const usedIds = new Set()
    productos.forEach(({ images = [], variants = [] }) => {
      images.forEach(img => {
        if (img?.cloudinaryId) usedIds.add(img.cloudinaryId)
      })
      variants.forEach(v => {
        if (v?.cloudinaryId) usedIds.add(v.cloudinaryId)
      })
    })

    // 2️⃣ Buscar imágenes en Cloudinary
    const folder = process.env.CLOUDINARY_FOLDER || ''
    const result = await cloudinary.search
      .expression(folder ? `folder:${folder}` : '')
      .max_results(500)
      .execute()

    const allResources = result.resources || []

    // 3️⃣ Detectar huérfanas
    const orphaned = allResources.filter(r => !usedIds.has(r.public_id))
    const deleted = []
    const failed = []

    // 4️⃣ Eliminar huérfanas en paralelo
    await Promise.all(
      orphaned.map(async r => {
        try {
          const resp = await cloudinary.uploader.destroy(r.public_id)
          if (resp.result === 'ok') {
            deleted.push(r.public_id)
          } else {
            failed.push({ id: r.public_id, result: resp.result })
          }
        } catch (err) {
          failed.push({ id: r.public_id, error: err.message })
        }
      })
    )

    // 5️⃣ Logs útiles en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📦 Total en Cloudinary: ${allResources.length}`)
      console.log(`🧩 Usadas en DB: ${usedIds.size}`)
      console.log(`🗑️ Huérfanas encontradas: ${orphaned.length}`)
      console.log(`✅ Eliminadas: ${deleted.length}`)
    }

    // 6️⃣ Respuesta final
    return res.status(200).json({
      ok: true,
      data: {
        totalCloudinary: allResources.length,
        totalUsedInDB: usedIds.size,
        orphanedCount: orphaned.length,
        deletedCount: deleted.length,
        deleted,
        ...(failed.length > 0 && { errors: failed })
      }
    })
  } catch (err) {
    console.error('❌ Error limpiando imágenes huérfanas:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al limpiar imágenes huérfanas.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    })
  }
}
