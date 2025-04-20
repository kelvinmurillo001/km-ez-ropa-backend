const Product = require("../../models/Product");
const { validationResult } = require("express-validator");

/**
 * ✅ Crear nuevo producto
 */
const createProduct = async (req, res) => {
  // Validación de errores
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  try {
    const {
      name,
      description = "",
      price,
      category,
      subcategory,
      tallaTipo,
      stock,
      featured = false,
      variants = [],
      images = [],
      color = "",
      sizes = [],
      createdBy
    } = req.body;

    // Validar campos obligatorios
    if (
      !name?.trim() ||
      !price ||
      !category?.trim() ||
      !subcategory?.trim() ||
      !tallaTipo?.trim() ||
      typeof stock !== "number" ||
      !createdBy?.trim() ||
      !Array.isArray(images) ||
      images.length !== 1
    ) {
      return res.status(400).json({ message: "⚠️ Faltan campos obligatorios o formato inválido." });
    }

    const [mainImage] = images;
    if (
      !mainImage.url ||
      !mainImage.cloudinaryId ||
      !mainImage.talla ||
      !mainImage.color
    ) {
      return res.status(400).json({ message: "⚠️ Imagen principal incompleta o inválida." });
    }

    // Validar variantes
    if (!Array.isArray(variants)) {
      return res.status(400).json({ message: "⚠️ Formato inválido para variantes." });
    }

    if (variants.length > 4) {
      return res.status(400).json({ message: "⚠️ Máximo 4 variantes permitidas." });
    }

    const combinaciones = new Set();
    for (const v of variants) {
      const talla = v.talla?.toLowerCase()?.trim();
      const color = v.color?.toLowerCase()?.trim();

      if (!talla || !color || !v.imageUrl || !v.cloudinaryId) {
        return res.status(400).json({ message: "⚠️ Cada variante debe tener talla, color, imagen y cloudinaryId." });
      }

      const clave = `${talla}-${color}`;
      if (combinaciones.has(clave)) {
        return res.status(400).json({ message: "⚠️ Variantes duplicadas detectadas (talla + color)." });
      }
      combinaciones.add(clave);
    }

    const producto = new Product({
      name: name.trim(),
      description: description.trim(),
      price,
      stock,
      category: category.toLowerCase().trim(),
      subcategory: subcategory.toLowerCase().trim(),
      tallaTipo: tallaTipo.toLowerCase().trim(),
      featured,
      variants,
      images,
      color: color.trim(),
      sizes: sizes.map(s => s.trim()),
      createdBy: createdBy.trim()
    });

    const saved = await producto.save();
    return res.status(201).json(saved);

  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    return res.status(500).json({
      message: "❌ Error interno al crear producto",
      error: error.message
    });
  }
};

module.exports = createProduct;
