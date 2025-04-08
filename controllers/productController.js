const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

/**
 * 📥 Obtener todos los productos (ordenados por más recientes)
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error del servidor al obtener productos' });
  }
};

/**
 * ➕ Crear nuevo producto con variantes
 * - Valida campos requeridos
 * - Cada variante debe tener talla, color, imageUrl, cloudinaryId
 * - Las imágenes ya deben haber sido subidas por separado (desde frontend)
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      subcategory,
      stock,
      featured,
      variants
    } = req.body;

    // Validación mínima de campos requeridos
    if (!name || !price || !category || !subcategory || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: '⚠️ Datos incompletos. Revisa el formulario' });
    }

    // Procesar variantes individualmente
    const processedVariants = variants.map(variant => {
      const { talla, color, imageUrl, cloudinaryId, stock: variantStock } = variant;

      if (!talla || !color || !imageUrl || !cloudinaryId) {
        throw new Error('⚠️ Cada variante debe incluir talla, color, imageUrl y cloudinaryId');
      }

      return {
        talla,
        color,
        imageUrl,
        cloudinaryId,
        stock: variantStock || 0
      };
    });

    const createdBy = req.user?.username || 'admin';

    const newProduct = new Product({
      name,
      price,
      category,
      subcategory,
      stock,
      featured: featured === 'true' || featured === true,
      variants: processedVariants,
      createdBy,
      updatedBy: ''
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
 * - Elimina variantes anteriores y sus imágenes en Cloudinary
 * - Reemplaza completamente por nuevas variantes
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      category,
      subcategory,
      stock,
      featured,
      variants
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    // 🧼 Eliminar imágenes antiguas de Cloudinary
    for (const old of product.variants) {
      if (old.cloudinaryId) await cloudinary.uploader.destroy(old.cloudinaryId);
    }

    // Validar y procesar nuevas variantes
    const updatedVariants = (Array.isArray(variants)) ? variants.map(v => {
      const { talla, color, imageUrl, cloudinaryId, stock: variantStock } = v;

      if (!talla || !color || !imageUrl || !cloudinaryId) {
        throw new Error('⚠️ Cada variante debe incluir talla, color, imageUrl y cloudinaryId');
      }

      return {
        talla,
        color,
        imageUrl,
        cloudinaryId,
        stock: variantStock || 0
      };
    }) : [];

    // Actualizar campos
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.subcategory = subcategory ?? product.subcategory;
    product.stock = stock ?? product.stock;
    product.featured = featured === 'true' || featured === true;
    product.variants = updatedVariants;
    product.updatedBy = req.user?.username || 'admin';

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    console.error('❌ Error actualizando producto:', error.message);
    res.status(500).json({ message: error.message || 'Error del servidor al actualizar producto' });
  }
};

/**
 * 🗑️ Eliminar producto
 * - Elimina imágenes en Cloudinary antes de borrar de la base de datos
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    // Eliminar cada imagen asociada
    for (const v of product.variants) {
      if (v.cloudinaryId) {
        await cloudinary.uploader.destroy(v.cloudinaryId);
      }
    }

    await product.deleteOne();
    res.json({ message: '✅ Producto eliminado correctamente' });
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
