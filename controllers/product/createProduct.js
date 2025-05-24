import Product from '../../models/Product.js';
import { validationResult } from 'express-validator';
import logger from '../../utils/logger.js';
import { slugify } from '../../utils/generarSlug.js'; // ✅ Importación slugify

/**
 * ✅ Crear nuevo producto (admin)
 * @route POST /api/products
 */
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('🛑 Validación fallida:', errors.array());
    return res.status(400).json({ ok: false, errors: errors.array() });
  }

  try {
    let {
      name,
      description = '',
      price,
      category,
      subcategory,
      tallaTipo,
      featured = false,
      variants = [],
      images = [],
      color = '',
      sizes = [],
      stock,
      createdBy
    } = req.body;

    // Normalizar campos
    name = name?.trim();
    description = description?.trim();
    category = category?.trim().toLowerCase();
    subcategory = subcategory?.trim().toLowerCase();
    tallaTipo = tallaTipo?.trim().toLowerCase();
    color = color?.trim().toLowerCase();
    createdBy = createdBy?.trim();

    if (!name || typeof price !== 'number' || !category || !tallaTipo || !createdBy) {
      return res.status(400).json({ ok: false, message: '⚠️ Faltan campos obligatorios.' });
    }

    if (!Array.isArray(images) || images.length !== 1) {
      return res.status(400).json({ ok: false, message: '⚠️ Debes enviar una imagen principal.' });
    }

    const [main] = images;
    if (!main.url || !main.cloudinaryId || !main.talla || !main.color) {
      return res.status(400).json({ ok: false, message: '⚠️ Imagen principal incompleta.' });
    }

    const hasVariants = Array.isArray(variants) && variants.length > 0;
    let generalStock = 0;

    if (hasVariants) {
      if (variants.length > 4) {
        return res.status(400).json({ ok: false, message: '⚠️ Máximo 4 variantes permitidas.' });
      }

      const combos = new Set();
      for (const v of variants) {
        const talla = v.talla?.trim().toLowerCase();
        const col = v.color?.trim().toLowerCase();
        const url = v.imageUrl?.trim();
        const id = v.cloudinaryId?.trim();
        const stk = Number(v.stock);

        if (!talla || !col || !url || !id || isNaN(stk)) {
          return res.status(400).json({ ok: false, message: '⚠️ Cada variante debe tener talla, color, imagen y stock válido.' });
        }

        const combo = `${talla}-${col}`;
        if (combos.has(combo)) {
          return res.status(400).json({ ok: false, message: '⚠️ Variantes duplicadas.' });
        }

        combos.add(combo);
      }
    } else {
      generalStock = Number(stock);
      if (isNaN(generalStock) || generalStock < 0) {
        return res.status(400).json({ ok: false, message: '⚠️ Stock general inválido.' });
      }
    }

    const duplicate = await Product.findOne({ name, subcategory });
    if (duplicate) {
      return res.status(409).json({ ok: false, message: '⚠️ Ya existe un producto con ese nombre y subcategoría.' });
    }

    const cleanedSizes = Array.isArray(sizes)
      ? sizes.filter(s => typeof s === 'string' && s.trim()).map(s => s.trim().toUpperCase())
      : [];

    const slugBase = slugify(name); // ✅ Usar función reutilizable
    let slug = slugBase;
    let exists = await Product.findOne({ slug });
    let attempts = 0;

    while (exists && attempts < 5) {
      slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;
      exists = await Product.findOne({ slug });
      attempts++;
    }

    if (exists) {
      logger.error('❌ No se pudo generar slug único tras 5 intentos:', slugBase);
      return res.status(500).json({ ok: false, message: '⚠️ No se pudo generar un slug único.' });
    }

    const productData = {
      name,
      description,
      price,
      category,
      subcategory,
      tallaTipo,
      featured: featured === true || featured === 'true',
      variants,
      stock: hasVariants ? undefined : generalStock,
      images,
      color,
      sizes: cleanedSizes,
      createdBy,
      isActive: true,
      slug
    };

    const newProduct = await Product.create(productData);

    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`✅ Producto creado: ${newProduct.name} [${newProduct.slug}]`);
    }

    return res.status(201).json({ ok: true, data: newProduct });
  } catch (err) {
    logger.error('❌ Error en createProduct:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al crear producto.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default createProduct;
