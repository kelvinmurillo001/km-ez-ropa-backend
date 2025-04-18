const Product = require('../../models/Product');
const { cloudinary } = require('../../config/cloudinary');

/**
 * 🗑️ Eliminar un producto completo (incluye imágenes en Cloudinary)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔍 Buscar producto
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: '❌ Producto no encontrado' });
    }

    // 🧹 Eliminar imágenes principales en Cloudinary
    if (product.images?.length) {
      for (const img of product.images) {
        if (img.cloudinaryId) {
          await cloudinary.uploader.destroy(img.cloudinaryId);
        }
      }
    }

    // 🧹 Eliminar imágenes de variantes en Cloudinary
    if (product.variants?.length) {
      for (const variant of product.variants) {
        if (variant.cloudinaryId) {
          await cloudinary.uploader.destroy(variant.cloudinaryId);
        }
      }
    }

    // 🧽 Eliminar el producto de la base de datos
    await product.deleteOne();

    return res.status(200).json({ message: '✅ Producto eliminado correctamente' });

  } catch (error) {
    console.error('❌ Error eliminando producto:', error.message);
    return res.status(500).json({
      message: '❌ Error al eliminar producto',
      error: error.message
    });
  }
};

module.exports = deleteProduct;
