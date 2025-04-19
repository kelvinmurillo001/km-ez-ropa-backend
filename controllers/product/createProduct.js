const Product = require("../../models/Product");
const { validationResult } = require("express-validator");

/**
 * ✅ Crear nuevo producto
 */
const createProduct = async (req, res) => {
  // ⚠️ Validaciones de express-validator
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  try {
    const {
      name,
      description,
      price,
      category,
      subcategory,
      tallaTipo,
      stock,
      featured = false,
      variants = [],
      images = [],
      color,
      sizes = [],
      createdBy
    } = req.body;

    // ✅ Validar campos obligatorios
    if (!name || !price || !category || !subcategory || !tallaTipo || !stock || !createdBy || !images.length) {
      return res.status(400).json({ message: "⚠️ Campos obligatorios faltantes" });
    }

    // 📸 Validación imagen principal
    const [mainImage] = images;
    if (!mainImage.url || !mainImage.cloudinaryId || !mainImage.talla || !mainImage.color) {
      return res.status(400).json({ message: "⚠️ Imagen principal incompleta" });
    }

    // 🎨 Validación de variantes (máx 4 y sin duplicados)
    if (variants.length > 4) {
      return res.status(400).json({ message: "⚠️ Máximo 4 variantes permitidas" });
    }

    const combinaciones = new Set();
    for (const v of variants) {
      const key = `${v.talla?.toLowerCase()}-${v.color?.toLowerCase()}`;
      if (combinaciones.has(key)) {
        return res.status(400).json({ message: "⚠️ No puede haber variantes duplicadas (talla + color)" });
      }
      combinaciones.add(key);
    }

    // ✅ Crear producto
    const nuevoProducto = new Product({
      name: name.trim(),
      description: description?.trim() || "",
      price,
      stock,
      category: category.toLowerCase(),
      subcategory: subcategory.toLowerCase(),
      tallaTipo: tallaTipo.toLowerCase(),
      featured,
      variants,
      images,
      color: color?.trim() || "",
      sizes,
      createdBy: createdBy.trim()
    });

    const saved = await nuevoProducto.save();
    return res.status(201).json(saved);

  } catch (error) {
    console.error("❌ Error al crear producto:", error.message);
    return res.status(500).json({
      message: "❌ Error interno al crear producto",
      error: error.message
    });
  }
};

module.exports = createProduct;
