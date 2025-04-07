const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary'); // 📦 Importa la config de Cloudinary
const fs = require('fs');
const path = require('path');

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

// ➕ Crear un nuevo producto con Cloudinary
const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      subcategory,
      stock,
      featured,
      talla,
      colores
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: '⚠️ Imagen del producto requerida' });
    }

    // ☁️ Subir imagen a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'km-ez-ropa'
    });

    const image = uploadResult.secure_url;
    const createdBy = req.user?.username || 'admin';

    if (!name || !price || !category || !subcategory || image === '') {
      return res.status(400).json({ message: '⚠️ Todos los campos obligatorios son requeridos' });
    }

    if (stock === undefined || isNaN(stock)) {
      return res.status(400).json({ message: '⚠️ Stock debe ser un número válido' });
    }

    const newProduct = new Product({
      name,
      price,
      category,
      subcategory,
      stock,
      talla,
      colores,
      featured: featured === 'true' || featured === true,
      image,
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

// ✏️ Actualizar producto con nueva imagen en Cloudinary si se proporciona
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
      talla,
      colores
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: '❌ Producto no encontrado' });
    }

    // ☁️ Subir nueva imagen si se proporciona
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'km-ez-ropa'
      });
      product.image = uploadResult.secure_url;
    }

    // 🔄 Actualizar campos
    product.name = name ?? product.name;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.subcategory = subcategory ?? product.subcategory;
    product.stock = stock !== undefined ? stock : product.stock;
    product.talla = talla ?? product.talla;
    product.colores = colores ?? product.colores;
    product.featured = featured === 'true' || featured === true;
    product.updatedBy = req.user?.username || 'admin';

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar producto' });
  }
};

// 🗑️ Eliminar producto (sin borrar imagen de Cloudinary por ahora)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // (Opcional) podrías eliminar imagen de Cloudinary si guardas el public_id
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
