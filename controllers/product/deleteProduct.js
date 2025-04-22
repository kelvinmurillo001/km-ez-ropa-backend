const Product = require('../../models/Product')
const { cloudinary } = require('../../config/cloudinary')
const mongoose = require('mongoose')

/**
 * 🗑️ Eliminar un producto completo (incluye imágenes en Cloudinary)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    // 🔒 Validación de ID
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

    const eliminarImagen = async (cloudinaryId, contexto = '') => {
      try {
        const result = await cloudinary.uploader.destroy(cloudinaryId)
        if (result.result === 'ok') {
          deletedCloudinaryIds.push(cloudinaryId)
        } else {
          failedDeletions.push({ cloudinaryId, context: contexto, result })
        }
      } catch (err) {
        failedDeletions.push({ cloudinaryId, context: contexto, error: err.message })
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

    return res.status(200).json({
      message: '✅ Producto eliminado correctamente',
      deletedCloudinaryIds,
      failedDeletions: failedDeletions.length ? failedDeletions : undefined
    })
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error)
    return res.status(500).json({
      message: '❌ Error interno al eliminar producto',
      error: error.message
    })
  }
}

module.exports = deleteProduct
