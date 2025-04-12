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
      name,
      price,
      category,
      subcategory,
      tallaTipo,
      stock,
      featured,
      variants = [],
      images = []
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: '❌ Producto no encontrado' });
    }

    // Eliminar imágenes anteriores si se subieron nuevas
    if (images.length > 0) {
      for (const img of product.images) {
        if (img.cloudinaryId) {
          await cloudinary.uploader.destroy(img.cloudinaryId);
        }
      }
    }

    // Eliminar imágenes de variantes si se reemplazan
    if (variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.cloudinaryId) {
          await cloudinary.uploader.destroy(variant.cloudinaryId);
        }
      }
    }

    // Procesar nuevas imágenes
    const processedImages = images.map(img => ({
      url: img.url,
      cloudinaryId: img.cloudinaryId
    }));

    // Procesar variantes
    const processedVariants = variants.map(v => ({
      talla: v.talla,
      color: v.color,
      imageUrl: v.imageUrl,
      cloudinaryId: v.cloudinaryId,
      stock: v.stock || 0
    }));

    // Actualizar datos del producto
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.subcategory = subcategory ?? product.subcategory;
    product.tallaTipo = tallaTipo ?? product.tallaTipo;
    product.stock = stock ?? product.stock;
    product.featured = featured === true || featured === 'true';
    product.images = processedImages.length ? processedImages : product.images;
    product.variants = processedVariants.length ? processedVariants : product.variants;
    product.updatedBy = req.user?.username || 'admin';

    const updated = await product.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('❌ Error actualizando producto:', error.message);
    res.status(500).json({ message: error.message || '❌ Error del servidor' });
  }
};

module.exports = updateProduct;
