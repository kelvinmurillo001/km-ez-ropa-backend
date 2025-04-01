const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// 📥 Obtener todos los productos
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }); // Ordenar por más recientes
    res.json(products);
  } catch (error) {
    console.error('❌ Error getting products:', error);
    res.status(500).json({ message: 'Server error getting products' });
  }
};

// ➕ Crear un nuevo producto
const createProduct = async (req, res) => {
  try {
    const { name, price, category, subcategory, stock, featured } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const createdBy = req.user?.username || 'admin';

    // 🧪 Validación de campos obligatorios
    if (!name || !price || !category || !subcategory || image === '') {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (stock === undefined || isNaN(stock)) {
      return res.status(400).json({ message: 'Stock must be a valid number' });
    }

    const newProduct = new Product({
      nombre: name,
      precio: price,
      categoria: category,
      subcategoria: subcategory,
      stock: stock,
      destacado: featured === 'true',
      imagen: image,
      creadoPor: createdBy,
      editadoPor: ''
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// ✏️ Actualizar producto existente
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, subcategory, stock, featured } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 🔁 Reemplazar imagen antigua si se sube una nueva
    if (req.file) {
      const oldImagePath = path.join(__dirname, '..', product.imagen);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      product.imagen = `/uploads/${req.file.filename}`;
    }

    // 🧠 Actualizar campos
    product.nombre = name || product.nombre;
    product.precio = price || product.precio;
    product.categoria = category || product.categoria;
    product.subcategoria = subcategory || product.subcategoria;
    product.stock = stock || product.stock;
    product.destacado = featured === 'true';
    product.editadoPor = req.user?.username || 'admin';

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// 🗑️ Eliminar producto
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 🖼️ Eliminar imagen del sistema de archivos
    const imagePath = path.join(__dirname, '..', product.imagen);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await product.deleteOne();
    res.json({ message: '✅ Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
