import Product from '../../models/Product.js'
import { cloudinary } from '../../config/cloudinary.js'
import mongoose from 'mongoose'

/**
 * 🗑️ Eliminar un producto (y sus imágenes en Cloudinary)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    // 🔒 Validar formato de ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '⚠️ ID de producto inválido' })
    }

    // 🔍 Buscar producto
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: '❌ Producto no encontrado' })
    }

    const deletedCloudinaryIds = []
    const failedDeletions = []

    // 📥 Función interna para eliminar imágenes
    const eliminarImagen = async (cloudinaryId, contexto = '') => {
      try {
        const res = await cloudinary.uploader.destroy(cloudinaryId)
        if (res.result === 'ok') {
          deletedCloudinaryIds.push(cloudinaryId)
          console.log(`🧹 Imagen eliminada: ${cloudinaryId} (${contexto})`)
        } else {
          failedDeletions.push({ cloudinaryId, contexto, result: res.result })
          console.warn(`⚠️ No se pudo eliminar: ${cloudinaryId} (${contexto})`)
        }
      } catch (err) {
        failedDeletions.push({ cloudinaryId, contexto, error: err.message })
        console.error(`❌ Error al eliminar: ${cloudinaryId} (${contexto})`, err.message)
      }
    }

    // 🖼️ Imágenes principales
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.cloudinaryId) await eliminarImagen(img.cloudinaryId, 'imagen principal')
      }
    }

    // 🎨 Imágenes de variantes
    if (Array.isArray(product.variants)) {
      for (const v of product.variants) {
        if (v.cloudinaryId) await eliminarImagen(v.cloudinaryId, 'variante')
      }
    }

    // 🧽 Eliminar producto de MongoDB
    await product.deleteOne()

    const response = {
      message: '✅ Producto eliminado correctamente',
      productId: product._id,
      deletedCloudinaryIds
    }

    if (failedDeletions.length > 0) {
      response.failedDeletions = failedDeletions
      response.warning = '⚠️ Algunas imágenes no se pudieron eliminar'
    }

    console.log(`🗑️ Producto eliminado: ${product.name} - ID: ${product._id}`)
    return res.status(200).json(response)

  } catch (err) {
    console.error('❌ Error interno al eliminar producto:', err)
    return res.status(500).json({
      message: '❌ Error interno al eliminar producto',
      error: err.message
    })
  }
}

export default deleteProduct
