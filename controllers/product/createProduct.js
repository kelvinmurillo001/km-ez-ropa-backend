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
      stock,
      featured,
      tallaTipo,
      variants = [],
      images = []
    } = req.body;

    // 🧪 Validaciones obligatorias
    if (!name?.trim() || typeof name !== "string") {
      return res.status(400).json({ message: "⚠️ El nombre del producto es obligatorio" });
    }

    if (!category || !subcategory || !tallaTipo) {
      return res.status(400).json({ message: "⚠️ Categoría, subcategoría y tipo de talla son obligatorios" });
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

    // ✅ Procesar imagen principal
    const processedImages = [{
      url: mainImage.url,
      cloudinaryId: mainImage.cloudinaryId,
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

    const processedVariants = variants.map(v => {
      if (!v.imageUrl || !v.talla || !v.color) {
        throw new Error("⚠️ Todas las variantes deben tener imagen, talla y color");
      }

      return {
        imageUrl: v.imageUrl,
        cloudinaryId: v.cloudinaryId || "",
        talla: v.talla.trim().toLowerCase(),
        color: v.color.trim().toLowerCase(),
        stock: typeof v.stock === "number" ? v.stock : 0
      };
    });

    // 🧑‍💻 Admin actual
    const createdBy = req.user?.username || "admin";

    // 🆕 Crear producto
    const newProduct = new Product({
      name: name.trim(),
      price,
      category,
      subcategory,
      tallaTipo,
      stock,
      featured: featured === true || featured === "true",
      variants: processedVariants,
      images: processedImages,
      createdBy
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("❌ Error creando producto:", error.message);
    res.status(500).json({
      message: "❌ Error del servidor al crear producto",
      error: error.message
    });
  }
};

module.exports = createProduct;
