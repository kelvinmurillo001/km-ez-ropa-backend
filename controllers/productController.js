const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const { validationResult } = require('express-validator');

/**
 * 📥 Obtener todos los productos (ordenados por más recientes)
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error del servidor al obtener productos' });
  }
};

/**
 * ➕ Crear nuevo producto
 */
const createProduct = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  try {
    const {
      name,
      price,
      category,
      subcategory,
      stock,
      featured,
      variants,
      mainImages
    } = req.body;

    // Validación adicional manual
    if (
      !name || !price || !category || !subcategory ||
      !Array.isArray(variants) || variants.length === 0 ||
      !Array.isArray(mainImages) || mainImages.length === 0
    ) {
      return res.status(400).json({
        message: '⚠️ Todos los campos son obligatorios (incluye variantes e imágenes principales)'
      });
    }

    const processedVariants = variants.map(v => {
      const { talla, color, imageUrl, cloudinaryId, stock: variantStock } = v;
      if (!talla || !color || !imageUrl || !cloudinaryId) {
        throw new Error('⚠️ Cada variante debe tener talla, color, imageUrl y cloudinaryId');
      }
      return {
        talla,
        color,
        imageUrl,
        cloudinaryId,
        stock: variantStock || 0,
      };
    });

    const processedImages = mainImages.map(img => {
      if (!img.url || !img.cloudinaryId) {
        throw new Error('⚠️ Cada imagen principal debe tener url y cloudinaryId');
      }
      return {
        url: img.url,
        cloudinaryId: img.cloudinaryId,
      };
    });

    const createdBy = req.user?.username || 'admin';

    const newProduct = new Product({
      name,
      price,
      category,
      subcategory,
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

/**
 * ✏️ Actualizar producto (elimina imágenes anteriores si se reemplazan)
 */
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
      stock,
      featured,
      variants,
      mainImages
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    // 🧹 Eliminar imágenes anteriores si se reemplazan
    if (product.images?.length) {
      for (const img of product.images) {
        if (img.cloudinaryId) await cloudinary.uploader.destroy(img.cloudinaryId);
      }
    }

    if (product.variants?.length) {
      for (const v of product.variants) {
        if (v.cloudinaryId) await cloudinary.uploader.destroy(v.cloudinaryId);
      }
    }

    const processedVariants = Array.isArray(variants)
      ? variants.map(v => {
          const { talla, color, imageUrl, cloudinaryId, stock: variantStock } = v;
          if (!talla || !color || !imageUrl || !cloudinaryId) {
            throw new Error('⚠️ Cada variante debe tener talla, color, imageUrl y cloudinaryId');
          }
          return {
            talla,
            color,
            imageUrl,
            cloudinaryId,
            stock: variantStock || 0
          };
        })
      : [];

    const processedImages = Array.isArray(mainImages)
      ? mainImages.map(img => {
          if (!img.url || !img.cloudinaryId) {
            throw new Error('⚠️ Cada imagen principal debe tener url y cloudinaryId');
          }
          return {
            url: img.url,
            cloudinaryId: img.cloudinaryId
          };
        })
      : [];

    // 🛠 Actualización de campos
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.subcategory = subcategory ?? product.subcategory;
    product.stock = stock ?? product.stock;
    product.featured = featured === true || featured === 'true';
    product.variants = processedVariants;
    product.images = processedImages;
    product.updatedBy = req.user?.username || 'admin';

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    console.error('❌ Error actualizando producto:', error.message);
    res.status(500).json({ message: error.message || 'Error del servidor al actualizar producto' });
  }
};

/**
 * 🗑️ Eliminar producto y sus imágenes asociadas
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    // 🧼 Eliminar imágenes en Cloudinary
    if (product.images?.length) {
      for (const img of product.images) {
        if (img.cloudinaryId) await cloudinary.uploader.destroy(img.cloudinaryId);
      }
    }

    if (product.variants?.length) {
      for (const v of product.variants) {
        if (v.cloudinaryId) await cloudinary.uploader.destroy(v.cloudinaryId);
      }
    }

    await product.deleteOne();
    res.json({ message: '✅ Producto y sus imágenes fueron eliminados correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error.message);
    res.status(500).json({ message: 'Error del servidor al eliminar producto' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
