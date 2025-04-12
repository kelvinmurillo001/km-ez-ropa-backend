const Product = require('../../models/Product');
const { cloudinary } = require('../../config/cloudinary');

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔎 Buscar el producto
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: '❌ Producto no encontrado' });
    }

    // 🧹 Eliminar imágenes principales de Cloudinary
    if (product.images && product.images.length) {
      for (const img of product.images) {
        if (img.cloudinaryId) {
          await cloudinary.uploader.destroy(img.cloudinaryId);
        }
      }
    }

    // 🧹 Eliminar imágenes de variantes
    if (product.variants && product.variants.length) {
      for (const v of product.variants) {
        if (v.cloudinaryId) {
          await cloudinary.uploader.destroy(v.cloudinaryId);
        }
      }
    }

    // 🗑️ Eliminar el documento en MongoDB
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
