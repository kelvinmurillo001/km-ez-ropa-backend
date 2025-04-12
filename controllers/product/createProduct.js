const Product = require('../../models/Product');
const { validationResult } = require('express-validator');

const createProduct = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  try {
    const {
      name, price, category, subcategory, stock,
      featured, tallaTipo, variants = [], images = []
    } = req.body;

    if (!name || !price || !category || !subcategory || !tallaTipo) {
      return res.status(400).json({ message: '⚠️ Faltan campos obligatorios' });
    }

    if (!Array.isArray(images) || images.length !== 1) {
      return res.status(400).json({ message: '⚠️ Debes subir exactamente 1 imagen principal' });
    }

    const [mainImage] = images;

    if (!mainImage.talla || !mainImage.color) {
      return res.status(400).json({ message: '⚠️ La imagen principal debe incluir talla y color' });
    }

    if (variants.length > 4) {
      return res.status(400).json({ message: '⚠️ Solo se permiten hasta 4 variantes' });
    }

    const processedImages = [{
      url: mainImage.url,
      cloudinaryId: mainImage.cloudinaryId,
      talla: mainImage.talla.toLowerCase(),
      color: mainImage.color.toLowerCase()
    }];

    const processedVariants = variants.map(v => ({
      talla: v.talla?.toLowerCase(),
      color: v.color?.toLowerCase(),
      imageUrl: v.imageUrl,
      cloudinaryId: v.cloudinaryId,
      stock: v.stock || 0
    }));

    const createdBy = req.user?.username || 'admin';

    const newProduct = new Product({
      name,
      price,
      category,
      subcategory,
      tallaTipo,
      stock,
      featured: featured === true || featured === 'true',
      variants: processedVariants,
      images: processedImages,
      createdBy
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('❌ Error creando producto:', error.message);
    res.status(500).json({ message: error.message || 'Error del servidor al crear producto' });
  }
};

module.exports = createProduct;
