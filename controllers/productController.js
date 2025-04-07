const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

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

// ➕ Crear un nuevo producto con múltiples variantes (talla + color + imagen)
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

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: '⚠️ Debes enviar al menos una variante' });
    }

    // Procesar cada variante: subir imagen y guardar su info
    const processedVariants = [];
    for (let v of variants) {
      if (!v.image || !v.talla || !v.color) continue;

      // Subir la imagen a Cloudinary
      const uploadRes = await cloudinary.uploader.upload(v.image, {
        folder: 'productos_kmezropa'
      });

      processedVariants.push({
        talla: v.talla,
        color: v.color,
        imageUrl: uploadRes.secure_url,
        cloudinaryId: uploadRes.public_id,
        stock: v.stock || 0
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

// ✏️ Actualizar producto
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
    if (!product) {
      return res.status(404).json({ message: '❌ Producto no encontrado' });
    }

    if (Array.isArray(variants)) {
      const updatedVariants = [];

      for (let v of variants) {
        if (!v.image || !v.talla || !v.color) continue;

        const uploadRes = await cloudinary.uploader.upload(v.image, {
          folder: 'productos_kmezropa'
        });

        updatedVariants.push({
          talla: v.talla,
          color: v.color,
          imageUrl: uploadRes.secure_url,
          cloudinaryId: uploadRes.public_id,
          stock: v.stock || 0
        });
      }

      product.variants = updatedVariants;
    }

    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.subcategory = subcategory ?? product.subcategory;
    product.stock = stock !== undefined ? stock : product.stock;
    product.featured = featured === 'true' || featured === true;
    product.updatedBy = req.user?.username || 'admin';

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar producto' });
  }
};

// 🗑️ Eliminar producto
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Opcional: eliminar imágenes de Cloudinary
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
