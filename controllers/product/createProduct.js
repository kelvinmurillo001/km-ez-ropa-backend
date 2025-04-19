// controllers/product/createProduct.js

const Product = require("../../models/Product");
const { validationResult } = require("express-validator");

const createProduct = async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Errores de validación", errors: errors.array() });
    }

    const {
      name,
      description,
      price,
      stock,
      category,
      subcategory,
      tallaTipo,
      sizes,
      color,
      featured,
      variants,
      images
    } = req.body;

    if (!images || !Array.isArray(images) || images.length !== 1) {
      return res.status(400).json({ message: "Se requiere una única imagen principal" });
    }

    const nuevoProducto = new Product({
      name,
      description,
      price,
      stock,
      category,
      subcategory,
      tallaTipo,
      sizes,
      color,
      featured: featured || false,
      variants: variants || [],
      images
    });

    const savedProduct = await nuevoProducto.save();

    res.status(201).json({
      message: "✅ Producto creado correctamente",
      product: savedProduct
    });

  } catch (err) {
    console.error("❌ Error al crear producto:", err);
    res.status(500).json({ message: "❌ Error interno del servidor" });
  }
};

module.exports = createProduct;
