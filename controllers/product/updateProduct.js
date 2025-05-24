import mongoose from 'mongoose';
import Product from '../../models/Product.js';
import { cloudinary } from '../../config/cloudinary.js';
import { validationResult } from 'express-validator';
import { calcularStockTotal } from '../../utils/calculateStock.js';
import logger from '../../utils/logger.js';
import { slugify } from '../../utils/generarSlug.js'; // ✅ Slug centralizado

const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }

  try {
    const id = req.params.id?.trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de producto inválido.' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ ok: false, message: '❌ Producto no encontrado.' });
    }

    const {
      name,
      price,
      category,
      subcategory,
      tallaTipo,
      featured,
      variants = [],
      images = [],
      sizes = [],
      color,
      stock
    } = req.body;

    // 📷 Procesar imagen principal
    let newImages = product.images;
    if (Array.isArray(images) && images.length === 1) {
      const img = images[0];
      if (!img.url || !img.cloudinaryId) {
        return res.status(400).json({ ok: false, message: '⚠️ Imagen principal incompleta.' });
      }

      const nuevaUrl = img.url.trim();
      const urlOriginal = product.images[0]?.url;

      if (urlOriginal !== nuevaUrl) {
        await Promise.all(product.images.map(i =>
          i.cloudinaryId ? cloudinary.uploader.destroy(i.cloudinaryId) : null
        ));

        newImages = [{
          url: nuevaUrl,
          cloudinaryId: img.cloudinaryId.trim(),
          talla: String(img.talla || '').trim().toLowerCase(),
          color: String(img.color || '').trim().toLowerCase()
        }];
      }
    } else if (images.length > 1) {
      return res.status(400).json({ ok: false, message: '⚠️ Solo se permite una imagen principal.' });
    }

    // 🎨 Procesar variantes
    let newVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      if (variants.length > 4) {
        return res.status(400).json({ ok: false, message: '⚠️ Máximo 4 variantes permitidas.' });
      }

      await Promise.all(product.variants.map(v =>
        v.cloudinaryId ? cloudinary.uploader.destroy(v.cloudinaryId) : null
      ));

      const comboSet = new Set();
      for (const v of variants) {
        const talla = String(v.talla || '').trim().toLowerCase();
        const col = String(v.color || '').trim().toLowerCase();
        const url = String(v.imageUrl || '').trim();
        const idImg = String(v.cloudinaryId || '').trim();
        const stk = Number(v.stock);
        const activo = v.active !== false;

        if (!talla || !col || !url || !idImg || isNaN(stk)) {
          return res.status(400).json({ ok: false, message: '⚠️ Variante incompleta o inválida.' });
        }

        const combo = `${talla}-${col}`;
        if (comboSet.has(combo)) {
          return res.status(400).json({ ok: false, message: '⚠️ Variantes duplicadas.' });
        }

        comboSet.add(combo);
        newVariants.push({
          talla,
          color: col,
          imageUrl: url,
          cloudinaryId: idImg,
          stock: stk,
          active: activo
        });
      }
    }

    // ✏️ Actualizar campos
    if (name && name.trim() !== product.name) {
      product.name = name.trim();

      // ✅ Regenerar slug con slugify()
      const slugBase = slugify(product.name);
      let slug = slugBase;
      let exists = await Product.findOne({ slug, _id: { $ne: id } });
      let attempts = 0;

      while (exists && attempts < 5) {
        slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;
        exists = await Product.findOne({ slug, _id: { $ne: id } });
        attempts++;
      }

      if (exists) {
        return res.status(409).json({ ok: false, message: '⚠️ No se pudo generar slug único.' });
      }

      product.slug = slug;
    }

    if (!isNaN(Number(price))) product.price = Number(price);
    if (category) product.category = String(category).trim().toLowerCase();
    if (subcategory) product.subcategory = String(subcategory).trim().toLowerCase();
    if (tallaTipo) product.tallaTipo = String(tallaTipo).trim().toLowerCase();
    if (typeof color === 'string') product.color = color.trim().toLowerCase();

    if (Array.isArray(sizes)) {
      product.sizes = sizes
        .filter(s => typeof s === 'string' && s.trim())
        .map(s => s.trim().toUpperCase());
    }

    product.featured = featured === true || featured === 'true';
    product.images = newImages;
    product.variants = newVariants;
    product.updatedBy = req.user?.username || 'admin';

    // 📦 Stock
    if (newVariants.length > 0) {
      product.stock = undefined;
    } else if (!isNaN(Number(stock))) {
      product.stock = Number(stock);
    }

    await product.save();

    const result = product.toObject();
    result.stockTotal = calcularStockTotal(result);

    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`✏️ Producto actualizado: ${result.name} (${result._id})`);
    }

    return res.status(200).json({ ok: true, data: result });
  } catch (err) {
    logger.error('❌ Error en updateProduct:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al actualizar producto.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default updateProduct;
