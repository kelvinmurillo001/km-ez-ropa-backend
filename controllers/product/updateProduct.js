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
      stock,
      featured,
      variants = [],
      images = []
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "❌ Producto no encontrado" });

    // 📸 Procesar imagen principal si hay nueva
    let processedImages = product.images;

    if (Array.isArray(images) && images.length > 0) {
      const mainImage = images[0];

      if (!mainImage.url || !mainImage.talla || !mainImage.color || !mainImage.cloudinaryId) {
        return res.status(400).json({
          message: "⚠️ La nueva imagen principal debe incluir URL, talla, color y cloudinaryId"
        });
      }

      // 🗑️ Borrar anteriores
      for (const img of product.images) {
        if (img.cloudinaryId) {
          await cloudinary.uploader.destroy(img.cloudinaryId);
        }
      }

      processedImages = [{
        url: mainImage.url.trim(),
        cloudinaryId: mainImage.cloudinaryId.trim(),
        talla: mainImage.talla.trim().toLowerCase(),
        color: mainImage.color.trim().toLowerCase()
      }];
    }

    // 🎨 Procesar variantes si se mandan nuevas
    let processedVariants = product.variants;

    if (Array.isArray(variants) && variants.length > 0) {
      if (variants.length > 4) {
        return res.status(400).json({ message: "⚠️ Solo se permiten hasta 4 variantes" });
      }

      // 🗑️ Borrar variantes anteriores
      for (const variant of product.variants) {
        if (variant.cloudinaryId) {
          await cloudinary.uploader.destroy(variant.cloudinaryId);
        }
      }

      const seen = new Set();
      processedVariants = variants.map(v => {
        if (!v.imageUrl || !v.talla || !v.color) {
          throw new Error("⚠️ Cada variante debe tener imagen, talla y color");
        }

        const key = `${v.talla.trim().toLowerCase()}-${v.color.trim().toLowerCase()}`;
        if (seen.has(key)) {
          throw new Error("⚠️ No puede haber variantes duplicadas (talla + color)");
        }
        seen.add(key);

        return {
          imageUrl: v.imageUrl.trim(),
          cloudinaryId: v.cloudinaryId?.trim() || "",
          talla: v.talla.trim().toLowerCase(),
          color: v.color.trim().toLowerCase(),
          stock: typeof v.stock === "number" ? v.stock : 0
        };
      });
    }

    // 📝 Actualizar campos
    if (name) product.name = name.trim();
    if (price !== undefined && typeof price === "number") product.price = price;
    if (category) product.category = category.trim().toLowerCase();
    if (subcategory) product.subcategory = subcategory.trim().toLowerCase();
    if (tallaTipo) product.tallaTipo = tallaTipo.trim().toLowerCase();
    if (stock !== undefined && typeof stock === "number") product.stock = stock;

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
