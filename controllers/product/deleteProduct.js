// 📁 backend/controllers/products/deleteProduct.js
import Product from '../../models/Product.js'
import { cloudinary } from '../../config/cloudinary.js'
import mongoose from 'mongoose'

/**
 * 🗑️ Eliminar un producto completo (incluye imágenes en Cloudinary)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    // 🔒 Validación de ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn(`🛑 Eliminación fallida: ID inválido ${id}`)
      return res.status(400).json({ message: '⚠️ ID de producto inválido' })
    }

    // 🔍 Buscar producto
    const product = await Product.findById(id)
    if (!product) {
      console.warn(`🛑 Eliminación fallida: producto no encontrado ID ${id}`)
      return res.status(404).json({ message: '❌ Producto no encontrado' })
    }

    const deletedCloudinaryIds = []
    const failedDeletions = []

    const eliminarImagen = async (cloudinaryId, contexto = '') => {
      try {
        const result = await cloudinary.uploader.destroy(cloudinaryId)
        if (result.result === 'ok') {
          deletedCloudinaryIds.push(cloudinaryId)
          console.log(`🧹 Imagen eliminada: ${cloudinaryId} [${contexto}]`)
        } else {
          failedDeletions.push({ cloudinaryId, context: contexto, result })
          console.warn(`⚠️ Fallo al eliminar imagen: ${cloudinaryId} [${contexto}]`)
        }
      } catch (err) {
        failedDeletions.push({ cloudinaryId, context: contexto, error: err.message })
        console.error(`❌ Error crítico eliminando imagen: ${cloudinaryId} [${contexto}]`, err.message)
      }
    }

    // 🖼️ Eliminar imagen principal
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.cloudinaryId) {
          await eliminarImagen(img.cloudinaryId, 'imagen principal')
        }
      }
    }

    // 🎨 Eliminar imágenes de variantes
    if (Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        if (variant.cloudinaryId) {
          await eliminarImagen(variant.cloudinaryId, 'imagen variante')
        }
      }
    }

    // 🧽 Eliminar el producto de la base de datos
    await product.deleteOne()

    console.log(`🗑️ Producto eliminado correctamente - ID: ${product._id}, Cloudinary eliminados: ${deletedCloudinaryIds.length}`)

    return res.status(200).json({
      message: '✅ Producto eliminado correctamente',
      deletedCloudinaryIds,
      ...(failedDeletions.length > 0 && { failedDeletions })
    })
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error)
    return res.status(500).json({
      message: '❌ Error interno al eliminar producto',
      error: error.message
    })
  }
}

export default deleteProduct
