const Product = require('../../models/Product');
const { cloudinary } = require('../../config/cloudinary');
const { validationResult } = require('express-validator');

/**
 * ✏️ Actualizar producto existente
 */
const updateProduct = async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errors: errores.array() });
  }

  try {
    const { id } = req.params;
    const {
      name,
      price,
      category,
      subcategory,
      tallaTipo,
      featured,
      variants = [],
      images = []
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "❌ Producto no encontrado" });
    }

    // =========================
    // 📸 Imagen Principal
    // =========================
    let processedImages = product.images;

    if (Array.isArray(images) && images.length === 1) {
      const mainImage = images[0];
      const { url, cloudinaryId, talla, color } = mainImage;

      if (!url || !cloudinaryId || !talla || !color) {
        return res.status(400).json({
          message: "⚠️ La imagen principal requiere url, cloudinaryId, talla y color"
        });
      }

      // 🧹 Eliminar imagen anterior
      for (const img of product.images) {
        if (img.cloudinaryId) {
          await cloudinary.uploader.destroy(img.cloudinaryId);
        }
      }

      processedImages = [{
        url: url.trim(),
        cloudinaryId: cloudinaryId.trim(),
        talla: talla.trim().toLowerCase(),
        color: color.trim().toLowerCase()
      }];
    } else if (images.length > 1) {
      return res.status(400).json({ message: "⚠️ Solo se permite una imagen principal" });
    }

    // =========================
    // 👕 Variantes
    // =========================
    let processedVariants = product.variants;

    if (Array.isArray(variants) && variants.length > 0) {
      if (variants.length > 4) {
        return res.status(400).json({ message: "⚠️ Máximo 4 variantes permitidas" });
      }

      const seen = new Set();
      processedVariants = [];

      // 🧹 Eliminar imágenes de variantes anteriores
      for (const v of product.variants) {
        if (v.cloudinaryId) {
          await cloudinary.uploader.destroy(v.cloudinaryId);
        }
      }

      for (const v of variants) {
        const key = `${v.talla?.trim().toLowerCase()}-${v.color?.trim().toLowerCase()}`;
        if (seen.has(key)) {
          return res.status(400).json({ message: "⚠️ Variantes duplicadas (talla + color)" });
        }
        seen.add(key);

        if (!v.imageUrl || !v.talla || !v.color || !v.cloudinaryId || typeof v.stock !== "number") {
          return res.status(400).json({
            message: "⚠️ Cada variante debe tener todos sus campos: imagen, talla, color, cloudinaryId y stock numérico"
          });
        }

        processedVariants.push({
          imageUrl: v.imageUrl.trim(),
          cloudinaryId: v.cloudinaryId.trim(),
          talla: v.talla.trim().toLowerCase(),
          color: v.color.trim().toLowerCase(),
          stock: v.stock
        });
      }
    }

    // =========================
    // 📝 Campos base
    // =========================
    if (name) product.name = name.trim();
    if (price !== undefined && !isNaN(price)) product.price = Number(price);
    if (category) product.category = category.trim().toLowerCase();
    if (subcategory) product.subcategory = subcategory.trim().toLowerCase();
    if (tallaTipo) product.tallaTipo = tallaTipo.trim().toLowerCase();

    product.featured = featured === true || featured === "true";
    product.images = processedImages;
    product.variants = processedVariants;
    product.updatedBy = req.user?.username || "admin";

    const updated = await product.save();

    return res.status(200).json(updated);

  } catch (error) {
    console.error("❌ Error actualizando producto:", error.message);
    return res.status(500).json({
      message: "❌ Error al actualizar producto",
      error: error.message
    });
  }
};

module.exports = updateProduct;
