const Product = require('../../models/Product');
const { cloudinary } = require('../../config/cloudinary');

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    for (const img of product.images) {
      if (img.cloudinaryId) await cloudinary.uploader.destroy(img.cloudinaryId);
    }

    for (const v of product.variants) {
      if (v.cloudinaryId) await cloudinary.uploader.destroy(v.cloudinaryId);
    }

    await product.deleteOne();
    res.json({ message: '✅ Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error.message);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

module.exports = deleteProduct;
