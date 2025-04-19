const Product = require('../../models/Product');
const { cloudinary } = require('../../config/cloudinary');
const { validationResult } = require('express-validator');

/**
 * ✏️ Actualizar producto existente
 */
const updateProduct = async (req, res) => {
  // ✅ Validación de errores con express-validator
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

    // ✅ Buscar producto existente
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "❌ Producto no encontrado" });
    }

    // 📸 Procesar imagen principal si se incluye nueva
    let processedImages = product.images;

    if (Array.isArray(images) && images.length === 1) {
      const mainImage = images[0];

      if (!mainImage.url || !mainImage.talla || !mainImage.color || !mainImage.cloudinaryId) {
        return res.status(400).json({
          message: "⚠️ La nueva imagen principal debe incluir URL, talla, color y cloudinaryId"
        });
      }

      // 🗑️ Borrar imágenes anteriores de Cloudinary
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
    } else if (images.length > 1) {
      return res.status(400).json({
        message: "⚠️ Solo se permite una imagen principal"
      });
    }

    // 👕 Procesar variantes si se incluyen nuevas
    let processedVariants = product.variants;

    if (Array.isArray(variants) && variants.length > 0) {
      if (variants.length > 4) {
        return res.status(400).json({ message: "⚠️ Solo se permiten hasta 4 variantes" });
      }

      // 🗑️ Borrar imágenes anteriores de las variantes
      for (const variant of product.variants) {
        if (variant.cloudinaryId) {
          await cloudinary.uploader.destroy(variant.cloudinaryId);
        }
      }

      const seen = new Set();
      processedVariants = variants.map((v) => {
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
          stock: typeof v.stock === "number" && v.stock >= 0 ? v.stock : 0
        };
      });
    }

    // 📝 Actualizar campos si fueron enviados
    if (name) product.name = name.trim();
    if (price !== undefined && !isNaN(price)) product.price = Number(price);
    if (category) product.category = category.trim().toLowerCase();
    if (subcategory) product.subcategory = subcategory.trim().toLowerCase();
    if (tallaTipo) product.tallaTipo = tallaTipo.trim().toLowerCase();
    if (stock !== undefined && !isNaN(stock)) product.stock = Number(stock);

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
