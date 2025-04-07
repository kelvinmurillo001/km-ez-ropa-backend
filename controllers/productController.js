const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// 📥 Obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error del servidor al obtener productos' });
  }
};

// ➕ Crear nuevo producto con variantes (base64 images desde frontend)
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

    if (!name || !price || !category || !subcategory || !variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: '⚠️ Datos incompletos. Revisa el formulario' });
    }

    const processedVariants = [];

    for (let variant of variants) {
      const { talla, color, imageUrl, cloudinaryId, stock: variantStock } = variant;

      if (!talla || !color || !imageUrl || !cloudinaryId) {
        return res.status(400).json({ message: '⚠️ Cada variante debe incluir talla, color, imageUrl y cloudinaryId' });
      }

      processedVariants.push({
        talla,
        color,
        imageUrl,
        cloudinaryId,
        stock: variantStock || 0
      });
    }

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
    console.error('❌ Error creando producto:', error);
    res.status(500).json({ message: 'Error del servidor al crear producto' });
  }
};

// ✏️ Actualizar producto con reemplazo completo de variantes
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

    // Eliminar imágenes antiguas de Cloudinary
    for (let old of product.variants) {
      if (old.cloudinaryId) {
        await cloudinary.uploader.destroy(old.cloudinaryId);
      }
    }

    const updatedVariants = [];

    if (Array.isArray(variants)) {
      for (let variant of variants) {
        const { talla, color, imageUrl, cloudinaryId, stock: variantStock } = variant;

        if (!talla || !color || !imageUrl || !cloudinaryId) {
          return res.status(400).json({ message: '⚠️ Cada variante debe incluir talla, color, imageUrl y cloudinaryId' });
        }

        updatedVariants.push({
          talla,
          color,
          imageUrl,
          cloudinaryId,
          stock: variantStock || 0
        });
      }
    }

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
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar producto' });
  }
};

// 🗑️ Eliminar producto + sus imágenes en Cloudinary
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: '❌ Producto no encontrado' });

    for (let v of product.variants) {
      if (v.cloudinaryId) {
        await cloudinary.uploader.destroy(v.cloudinaryId);
      }
    }

    await product.deleteOne();
    res.json({ message: '✅ Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar producto' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
