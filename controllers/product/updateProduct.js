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

    // 🔍 Buscar producto
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "❌ Producto no encontrado" });
    }

    // 🧼 Validación de imágenes si hay nuevas
    if (Array.isArray(images) && images.length > 0) {
      const mainImage = images[0];
      if (!mainImage.url || !mainImage.talla || !mainImage.color) {
        return res.status(400).json({
          message: "⚠️ La nueva imagen principal debe incluir URL, talla y color"
        });
      }

      // 🗑️ Eliminar imagen principal anterior
      for (const img of product.images) {
        if (img.cloudinaryId) {
          await cloudinary.uploader.destroy(img.cloudinaryId);
        }
      }
    }

    // 🧼 Validación y limpieza de variantes
    let processedVariants = product.variants;
    if (Array.isArray(variants) && variants.length > 0) {
      // 🗑️ Eliminar variantes anteriores si hay nuevas
      for (const variant of product.variants) {
        if (variant.cloudinaryId) {
          await cloudinary.uploader.destroy(variant.cloudinaryId);
        }
      }

      processedVariants = variants.map(v => {
        if (!v.imageUrl || !v.talla || !v.color) {
          throw new Error("⚠️ Cada variante debe incluir imagen, talla y color");
        }

        return {
          imageUrl: v.imageUrl,
          cloudinaryId: v.cloudinaryId || "",
          talla: v.talla.trim().toLowerCase(),
          color: v.color.trim().toLowerCase(),
          stock: typeof v.stock === "number" ? v.stock : 0
        };
      });
    }

    // ✅ Procesar imagen principal si se actualiza
    const processedImages = Array.isArray(images) && images.length > 0
      ? [{
          url: images[0].url,
          cloudinaryId: images[0].cloudinaryId || "",
          talla: images[0].talla.trim().toLowerCase(),
          color: images[0].color.trim().toLowerCase()
        }]
      : product.images;

    // 📝 Actualizar campos
    product.name = name?.trim() || product.name;
    product.price = typeof price === "number" ? price : product.price;
    product.category = category?.trim() || product.category;
    product.subcategory = subcategory?.trim() || product.subcategory;
    product.tallaTipo = tallaTipo?.trim() || product.tallaTipo;
    product.stock = typeof stock === "number" ? stock : product.stock;
    product.featured = featured === true || featured === "true";
    product.images = processedImages;
    product.variants = processedVariants;
    product.updatedBy = req.user?.username || "admin";

    const updated = await product.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Error actualizando producto:", error.message);
    res.status(500).json({
      message: "❌ Error al actualizar producto",
      error: error.message
    });
  }
};

module.exports = updateProduct;
