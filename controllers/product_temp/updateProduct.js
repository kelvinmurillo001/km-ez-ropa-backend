const Product = require('../../models/Product');
const { cloudinary } = require('../../config/cloudinary');
const { validationResult } = require('express-validator');

const updateProduct = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  try {
    const { id } = req.params;
    const {
      name, price, category, subcategory, tallaTipo,
      stock, featured, variants = [], mainImages = []
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    if (mainImages.length > 0) {
      for (const img of product.images) {
        if (img.cloudinaryId) await cloudinary.uploader.destroy(img.cloudinaryId);
      }
    }

    if (variants.length > 0) {
      for (const v of product.variants) {
        if (v.cloudinaryId) await cloudinary.uploader.destroy(v.cloudinaryId);
      }
    }

    const processedImages = mainImages.map(img => ({
      url: img.url,
      cloudinaryId: img.cloudinaryId
    }));

    const processedVariants = variants.map(v => ({
      talla: v.talla,
      color: v.color,
      imageUrl: v.imageUrl,
      cloudinaryId: v.cloudinaryId,
      stock: v.stock || 0
    }));

    Object.assign(product, {
      name: name ?? product.name,
      price: price ?? product.price,
      category: category ?? product.category,
      subcategory: subcategory ?? product.subcategory,
      tallaTipo: tallaTipo ?? product.tallaTipo,
      stock: stock ?? product.stock,
      featured: featured === true || featured === 'true',
      variants: processedVariants.length ? processedVariants : product.variants,
      images: processedImages.length ? processedImages : product.images,
      updatedBy: req.user?.username || 'admin'
    });

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    console.error('❌ Error actualizando producto:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = updateProduct;
