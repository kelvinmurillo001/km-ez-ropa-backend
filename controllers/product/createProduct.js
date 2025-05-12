import Product from '../../models/Product.js';
import { validationResult } from 'express-validator';

/**
 * ✅ Crear nuevo producto (con o sin variantes) + slug único
 * @route   POST /api/products
 * @access  Admin
 */
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('🛑 Validación fallida al crear producto:', errors.array());
    return res.status(400).json({ ok: false, errors: errors.array() });
  }

  try {
    // 🧹 Normalización de entradas
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

    name = String(name || '').trim();
    description = String(description || '').trim();
    category = String(category || '').trim().toLowerCase();
    subcategory = String(subcategory || '').trim().toLowerCase();
    tallaTipo = String(tallaTipo || '').trim().toLowerCase();
    createdBy = String(createdBy || '').trim();
    color = String(color || '').trim().toLowerCase();

    if (!name || typeof price !== 'number' || !category || !tallaTipo || !createdBy) {
      return res.status(400).json({ ok: false, message: '⚠️ Faltan campos obligatorios.' });
    }

    // 📷 Validación de imagen principal
    if (!Array.isArray(images) || images.length !== 1) {
      return res.status(400).json({ ok: false, message: '⚠️ Debes enviar solo una imagen principal.' });
    }

    const main = images[0];
    if (!main.url || !main.cloudinaryId || !main.talla || !main.color) {
      return res.status(400).json({ ok: false, message: '⚠️ Imagen principal incompleta.' });
    }

    // 🧬 Validación de variantes
    const hasVariants = Array.isArray(variants) && variants.length > 0;
    let generalStock = 0;

    if (hasVariants) {
      if (variants.length > 4) {
        return res.status(400).json({ ok: false, message: '⚠️ Máximo 4 variantes permitidas.' });
      }

      const combos = new Set();
      for (const v of variants) {
        const talla = String(v.talla || '').trim().toLowerCase();
        const col = String(v.color || '').trim().toLowerCase();
        const url = String(v.imageUrl || '').trim();
        const id = String(v.cloudinaryId || '').trim();
        const stk = Number(v.stock);

        if (!talla || !col || !url || !id || isNaN(stk)) {
          return res.status(400).json({
            ok: false,
            message: '⚠️ Cada variante debe tener talla, color, imagen, cloudinaryId y stock válido.'
          });
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

    // 🧪 Verificación de duplicado por nombre y subcategoría
    const duplicate = await Product.findOne({ name, subcategory });
    if (duplicate) {
      return res.status(409).json({ ok: false, message: '⚠️ Ya existe un producto con ese nombre y subcategoría.' });
    }

    // 🔡 Limpieza de tallas
    const cleanedSizes = Array.isArray(sizes)
      ? sizes.filter(s => typeof s === 'string' && s.trim()).map(s => s.trim().toUpperCase())
      : [];

    // 🔠 Slug único
    const slugBase = name
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .toLowerCase();

    let slug = slugBase;
    let exists = await Product.findOne({ slug });
    let attempts = 0;

    while (exists && attempts < 5) {
      slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;
      exists = await Product.findOne({ slug });
      attempts++;
    }

    if (exists) {
      return res.status(500).json({ ok: false, message: '⚠️ No se pudo generar un slug único.' });
    }

    // 📦 Preparar producto
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
      console.log(`✅ Producto creado: ${newProduct.name} [${newProduct.slug}]`);
    }

    return res.status(201).json({ ok: true, data: newProduct });
  } catch (err) {
    console.error('❌ Error interno al crear producto:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al crear producto.',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

export default createProduct;
