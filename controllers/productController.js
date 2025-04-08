const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

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
 * ➕ Crear nuevo producto con variantes
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

    // 🔍 Validación
    if (!name || !price || !category || !subcategory || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: '⚠️ Datos incompletos. Revisa el formulario' });
    }

    const processedVariants = variants.map(v => {
      const { talla, color, imageUrl, cloudinaryId, stock: variantStock } = v;
      if (!talla || !color || !imageUrl || !cloudinaryId) {
        throw new Error('⚠️ Cada variante debe incluir talla, color, imageUrl y cloudinaryId');
      }
      return {
        talla,
        color,
        imageUrl,
        cloudinaryId,
        stock: variantStock || 0,
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
      createdBy,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('❌ Error creando producto:', error.message);
    res.status(500).json({ message: error.message || 'Error del servidor al crear producto' });
  }
};

/**
 * ✏️ Actualizar producto (con reemplazo de imágenes antiguas)
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

    // 🧼 Eliminar imágenes anteriores de Cloudinary
    for (const variant of product.variants) {
      if (variant.cloudinaryId) {
        await cloudinary.uploader.destroy(variant.cloudinaryId);
      }
    }

    const processedVariants = Array.isArray(variants) ? variants.map(v => {
      const { talla, color, imageUrl, cloudinaryId, stock: variantStock } = v;
      if (!talla || !color || !imageUrl || !cloudinaryId) {
        throw new Error('⚠️ Cada variante debe incluir talla, color, imageUrl y cloudinaryId');
      }
      return {
        talla,
        color,
        imageUrl,
        cloudinaryId,
        stock: variantStock || 0,
      };
    }) : [];

    // 🛠 Actualizar producto
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.subcategory = subcategory ?? product.subcategory;
    product.stock = stock ?? product.stock;
    product.featured = featured === true || featured === 'true';
    product.variants = processedVariants;
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

    for (const variant of product.variants) {
      if (variant.cloudinaryId) {
        await cloudinary.uploader.destroy(variant.cloudinaryId);
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
