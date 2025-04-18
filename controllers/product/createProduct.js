const Product = require('../../models/Product');
const { validationResult } = require('express-validator');

/**
 * ➕ Crear nuevo producto
 */
const createProduct = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  try {
    const {
      name,
      price,
      category,
      subcategory,
      tallaTipo,
      stock,
      featured,
      variants = [],
      images = []
    } = req.body;

    // 🧪 Validaciones básicas
    if (!name?.trim()) return res.status(400).json({ message: "⚠️ El nombre es obligatorio" });
    if (!category || !subcategory || !tallaTipo)
      return res.status(400).json({ message: "⚠️ Categoría, subcategoría y tipo de talla son obligatorios" });

    const validTipos = ["adulto", "niño", "niña", "bebé"];
    if (!validTipos.includes(tallaTipo.toLowerCase())) {
      return res.status(400).json({ message: "⚠️ Tipo de talla inválido" });
    }

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({ message: "⚠️ El precio debe ser un número mayor a 0" });
    }

    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({ message: "⚠️ Stock inválido" });
    }

    // 📸 Imagen principal
    if (!Array.isArray(images) || images.length !== 1) {
      return res.status(400).json({ message: "⚠️ Debes subir exactamente 1 imagen principal" });
    }

    const [mainImage] = images;
    if (
      !mainImage.url ||
      !mainImage.cloudinaryId ||
      !mainImage.talla ||
      !mainImage.color
    ) {
      return res.status(400).json({ message: "⚠️ La imagen principal debe tener URL, ID, talla y color" });
    }

    const processedImages = [{
      url: mainImage.url.trim(),
      cloudinaryId: mainImage.cloudinaryId.trim(),
      talla: mainImage.talla.trim().toLowerCase(),
      color: mainImage.color.trim().toLowerCase()
    }];

    // 🎨 Variantes
    if (!Array.isArray(variants)) {
      return res.status(400).json({ message: "⚠️ Variantes debe ser un arreglo" });
    }

    if (variants.length > 4) {
      return res.status(400).json({ message: "⚠️ Solo se permiten hasta 4 variantes" });
    }

    const seen = new Set();
    const processedVariants = variants.map(v => {
      if (!v.imageUrl || !v.talla || !v.color) {
        throw new Error("⚠️ Todas las variantes deben tener imagen, talla y color");
      }

      const key = `${v.talla.trim().toLowerCase()}-${v.color.trim().toLowerCase()}`;
      if (seen.has(key)) {
        throw new Error("⚠️ No puede haber variantes duplicadas (talla + color)");
      }
      seen.add(key);

      if (typeof v.stock !== "number" || v.stock < 0) {
        throw new Error("⚠️ El stock de cada variante debe ser un número válido");
      }

      return {
        imageUrl: v.imageUrl.trim(),
        cloudinaryId: v.cloudinaryId?.trim() || "",
        talla: v.talla.trim().toLowerCase(),
        color: v.color.trim().toLowerCase(),
        stock: v.stock
      };
    });

    const createdBy = req.user?.username || "admin";

    const newProduct = new Product({
      name: name.trim(),
      price,
      category: category.trim().toLowerCase(),
      subcategory: subcategory.trim().toLowerCase(),
      tallaTipo: tallaTipo.trim().toLowerCase(),
      stock,
      featured: featured === true || featured === "true",
      images: processedImages,
      variants: processedVariants,
      createdBy
    });

    await newProduct.save();
    return res.status(201).json(newProduct);

  } catch (error) {
    console.error("❌ Error creando producto:", error.message);
    return res.status(500).json({
      message: "❌ Error del servidor al crear producto",
      error: error.message
    });
  }
};

module.exports = createProduct;
