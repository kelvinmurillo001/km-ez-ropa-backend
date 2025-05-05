import Product from '../../models/Product.js'
import { validationResult } from 'express-validator'

/**
 * ✅ Crear nuevo producto (con o sin variantes) + slug único
 */
const createProduct = async (req, res) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    console.warn('🛑 Error de validación al crear producto:', errores.array())
    return res.status(400).json({ errors: errores.array() })
  }

  try {
    const {
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
    } = req.body

    if (
      !name?.trim() ||
      typeof price !== 'number' ||
      !category?.trim() ||
      !subcategory?.trim() ||
      !tallaTipo?.trim() ||
      !createdBy?.trim() ||
      !Array.isArray(images) ||
      images.length !== 1
    ) {
      return res.status(400).json({ message: '⚠️ Faltan campos obligatorios o formato inválido.' })
    }

    // 🔍 Verificar duplicado por nombre + subcategoría
    const existe = await Product.findOne({
      name: name.trim(),
      subcategory: subcategory.trim().toLowerCase()
    })

    if (existe) {
      return res.status(409).json({
        message: '⚠️ Ya existe un producto con ese nombre y subcategoría.'
      })
    }

    // ✅ Validar imagen principal
    const [mainImage] = images
    if (!mainImage.url || !mainImage.cloudinaryId || !mainImage.talla || !mainImage.color) {
      return res.status(400).json({ message: '⚠️ Imagen principal incompleta o inválida.' })
    }

    // 🔍 Validar variantes
    let stockGeneral = 0
    if (variants.length > 0) {
      if (variants.length > 4) {
        return res.status(400).json({ message: '⚠️ Máximo 4 variantes permitidas.' })
      }

      const combinaciones = new Set()
      for (const v of variants) {
        const talla = v.talla?.trim().toLowerCase()
        const color = v.color?.trim().toLowerCase()
        const stock = v.stock

        if (!talla || !color || !v.imageUrl || !v.cloudinaryId || typeof stock !== 'number') {
          return res.status(400).json({
            message: '⚠️ Cada variante debe tener talla, color, imagen, cloudinaryId y stock válido.'
          })
        }

        const clave = `${talla}-${color}`
        if (combinaciones.has(clave)) {
          return res.status(400).json({
            message: '⚠️ Variantes duplicadas detectadas (talla + color).'
          })
        }
        combinaciones.add(clave)
      }
    } else {
      stockGeneral = parseInt(stock)
      if (isNaN(stockGeneral) || stockGeneral < 0) {
        return res.status(400).json({
          message: '⚠️ Stock general inválido (solo se usa si no hay variantes).'
        })
      }
    }

    // 🔡 Normalizar tallas
    const tallasLimpias = Array.isArray(sizes)
      ? sizes.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim().toUpperCase())
      : []

    // 🧠 Generar slug único basado en nombre
    const slugBase = name.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n').replace(/\s+/g, '-').replace(/[^\w-]/g, '')

    let slug = slugBase
    let slugExists = await Product.findOne({ slug })
    let intentos = 0

    while (slugExists && intentos < 5) {
      intentos++
      slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`
      slugExists = await Product.findOne({ slug })
    }

    if (slugExists) {
      return res.status(500).json({ message: '⚠️ No se pudo generar un slug único. Intenta con otro nombre.' })
    }

    // 📦 Crear producto
    const producto = new Product({
      name: name.trim(),
      description: description.trim(),
      price,
      category: category.trim().toLowerCase(),
      subcategory: subcategory.trim().toLowerCase(),
      tallaTipo: tallaTipo.trim().toLowerCase(),
      featured,
      variants,
      stock: variants.length === 0 ? stockGeneral : undefined,
      images,
      color: color.trim().toLowerCase(),
      sizes: tallasLimpias,
      createdBy: createdBy.trim(),
      isActive: true,
      slug // 🆕 agregado manualmente
    })

    const saved = await producto.save()
    console.log(`✅ Producto creado: ${saved.name} [${saved.slug}]`)
    return res.status(201).json(saved)

  } catch (err) {
    console.error('❌ Error al crear producto:', err)
    return res.status(500).json({
      message: '❌ Error interno al crear producto',
      error: err.message
    })
  }
}

export default createProduct
