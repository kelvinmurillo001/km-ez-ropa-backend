const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// 📥 Obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (error) {
    console.error('❌ Error getting products:', error);
    res.status(500).json({ message: 'Server error getting products' });
  }
};

// ➕ Crear un nuevo producto
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

    // ✅ URL completa para servir la imagen en frontend
    const image = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : '';
    const createdBy = req.user?.username || 'admin';

    if (!name || !price || !category || !subcategory || image === '') {
      return res.status(400).json({ message: 'Todos los campos obligatorios son requeridos' });
    }

    if (stock === undefined || isNaN(stock)) {
      return res.status(400).json({ message: 'Stock debe ser un número válido' });
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
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// ✏️ Actualizar producto existente
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
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // 🔁 Reemplazar imagen si se sube nueva (URL completa)
    if (req.file) {
      const oldImagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      product.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // 🧠 Actualizar campos
    product.name = name || product.name;
    product.price = price || product.price;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    product.stock = stock || product.stock;
    product.talla = talla || product.talla;
    product.colores = colores || product.colores;
    product.featured = featured === 'true' || featured === true;
    product.updatedBy = req.user?.username || 'admin';

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({ message: 'Server error updating product' });
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

    const imagePath = path.join(__dirname, '..', product.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await product.deleteOne();
    res.json({ message: '✅ Producto eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
