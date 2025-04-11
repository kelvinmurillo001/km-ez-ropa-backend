const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const { validationResult } = require('express-validator');

/**
 * 📥 Obtener todos los productos
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
 * ➕ Crear producto
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
      tallaTipo,
      variants = [],
      mainImages = []
    } = req.body;

    // Validaciones manuales
    if (!name || !price || !category || !subcategory || !tallaTipo) {
      return res.status(400).json({ message: '⚠️ Faltan campos obligatorios (nombre, precio, categoría, subcategoría, tipo de talla)' });
    }

    // Validar que haya exactamente 1 imagen principal
    if (!Array.isArray(mainImages) || mainImages.length !== 1) {
      return res.status(400).json({
        message: '⚠️ Debes subir exactamente 1 imagen principal'
      });
    }

    // Validar variantes si existen (máximo 4)
    if (Array.isArray(variants)) {
      if (variants.length > 4) {
        return res.status(400).json({ message: '⚠️ Solo se permiten hasta 4 variantes' });
      }

      for (const v of variants) {
        if (!v.talla || !v.color || !v.imageUrl || !v.cloudinaryId) {
          return res.status(400).json({
            message: '⚠️ Cada variante debe tener talla, color, imageUrl y cloudinaryId'
          });
        }
      }
    }

    const processedImages = mainImages.map(img => {
      if (!img.url || !img.cloudinaryId) {
        throw new Error('⚠️ Cada imagen principal debe tener url y cloudinaryId');
      }
      return {
        url: img.url,
        cloudinaryId: img.cloudinaryId
      };
    });

    const processedVariants = variants.map(v => ({
      talla: v.talla,
      color: v.color,
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

/**
 * ✏️ Actualizar producto
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
      tallaTipo,
      stock,
      featured,
      variants = [],
      mainImages = []
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    // Borrar imágenes antiguas si hay nuevas
    if (mainImages.length > 0) {
      for (const img of product.images || []) {
        if (img.cloudinaryId) await cloudinary.uploader.destroy(img.cloudinaryId);
      }
    }

    if (variants.length > 0) {
      for (const v of product.variants || []) {
        if (v.cloudinaryId) await cloudinary.uploader.destroy(v.cloudinaryId);
      }
    }

    const processedImages = mainImages.map(img => {
      if (!img.url || !img.cloudinaryId) {
        throw new Error('⚠️ Cada imagen principal debe tener url y cloudinaryId');
      }
      return {
        url: img.url,
        cloudinaryId: img.cloudinaryId
      };
    });

    const processedVariants = variants.map(v => {
      if (!v.talla || !v.color || !v.imageUrl || !v.cloudinaryId) {
        throw new Error('⚠️ Cada variante debe tener talla, color, imageUrl y cloudinaryId');
      }
      return {
        talla: v.talla,
        color: v.color,
        imageUrl: v.imageUrl,
        cloudinaryId: v.cloudinaryId,
        stock: v.stock || 0
      };
    });

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.subcategory = subcategory ?? product.subcategory;
    product.tallaTipo = tallaTipo ?? product.tallaTipo;
    product.stock = stock ?? product.stock;
    product.featured = featured === true || featured === 'true';
    product.variants = processedVariants.length ? processedVariants : product.variants;
    product.images = processedImages.length ? processedImages : product.images;
    product.updatedBy = req.user?.username || 'admin';

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    console.error('❌ Error actualizando producto:', error.message);
    res.status(500).json({ message: error.message || 'Error al actualizar producto' });
  }
};

/**
 * 🗑️ Eliminar producto
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    for (const img of product.images || []) {
      if (img.cloudinaryId) await cloudinary.uploader.destroy(img.cloudinaryId);
    }

    for (const v of product.variants || []) {
      if (v.cloudinaryId) await cloudinary.uploader.destroy(v.cloudinaryId);
    }

    await product.deleteOne();
    res.json({ message: '✅ Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error.message);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
