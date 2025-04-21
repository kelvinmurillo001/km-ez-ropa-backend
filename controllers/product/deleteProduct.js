const Product = require('../../models/Product');
const { cloudinary } = require('../../config/cloudinary');
const mongoose = require('mongoose');

/**
 * 🗑️ Eliminar un producto completo (incluye imágenes en Cloudinary)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔎 Validar ID de MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: '⚠️ ID de producto inválido' });
    }

    // 🔍 Buscar el producto
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: '❌ Producto no encontrado' });
    }

    const deletedCloudinaryIds = [];

    // 🧹 Eliminar imagen principal
    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(img.cloudinaryId);
            deletedCloudinaryIds.push(img.cloudinaryId);
          } catch (err) {
            console.warn(`⚠️ Error eliminando imagen principal: ${img.cloudinaryId}`, err.message);
          }
        }
      }
    }

    // 🧹 Eliminar imágenes de variantes
    if (Array.isArray(product.variants)) {
      for (const variant of product.variants) {
        if (variant.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(variant.cloudinaryId);
            deletedCloudinaryIds.push(variant.cloudinaryId);
          } catch (err) {
            console.warn(`⚠️ Error eliminando imagen de variante: ${variant.cloudinaryId}`, err.message);
          }
        }
      }
    }

    // 🧽 Eliminar producto en DB
    await product.deleteOne();

    return res.status(200).json({
      message: '✅ Producto eliminado correctamente',
      deletedCloudinaryIds
    });

  } catch (error) {
    console.error('❌ Error eliminando producto:', error);
    return res.status(500).json({
      message: '❌ Error interno al eliminar producto',
      error: error.message
    });
  }
};

module.exports = deleteProduct;
