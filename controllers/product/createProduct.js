const Product = require('../../models/Product')
const { validationResult } = require('express-validator')

/**
 * ✅ Crear nuevo producto
 */
const createProduct = async (req, res) => {
  // Validación de datos con express-validator
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
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
      createdBy
    } = req.body

    // Validación general
    if (
      !name?.trim() ||
      !price ||
      !category?.trim() ||
      !subcategory?.trim() ||
      !tallaTipo?.trim() ||
      !createdBy?.trim() ||
      !Array.isArray(images) ||
      images.length !== 1
    ) {
      return res.status(400).json({ message: '⚠️ Faltan campos obligatorios o formato inválido.' })
    }

    // Verificar que el producto no exista (por nombre + subcategoría)
    const existe = await Product.findOne({
      name: name.trim(),
      subcategory: subcategory.trim().toLowerCase()
    })

    if (existe) {
      return res
        .status(409)
        .json({ message: '⚠️ Ya existe un producto con ese nombre y subcategoría.' })
    }

    // Validación de imagen principal
    const [mainImage] = images
    if (!mainImage.url || !mainImage.cloudinaryId || !mainImage.talla || !mainImage.color) {
      return res.status(400).json({ message: '⚠️ Imagen principal incompleta o inválida.' })
    }

    // Validación de variantes
    if (!Array.isArray(variants)) {
      return res.status(400).json({ message: '⚠️ Formato inválido para variantes.' })
    }

    if (variants.length > 4) {
      return res.status(400).json({ message: '⚠️ Máximo 4 variantes permitidas.' })
    }

    const combinaciones = new Set()
    for (const v of variants) {
      const talla = v.talla?.toLowerCase()?.trim()
      const color = v.color?.toLowerCase()?.trim()
      const stock = v.stock

      if (!talla || !color || !v.imageUrl || !v.cloudinaryId || typeof stock !== 'number') {
        return res.status(400).json({
          message:
            '⚠️ Cada variante debe tener talla, color, imagen, cloudinaryId y stock numérico.'
        })
      }

      const clave = `${talla}-${color}`
      if (combinaciones.has(clave)) {
        return res
          .status(400)
          .json({ message: '⚠️ Variantes duplicadas detectadas (talla + color).' })
      }
      combinaciones.add(clave)
    }

    // Limpieza de tallas (si se proporcionan)
    const tallasLimpias = Array.isArray(sizes)
      ? sizes
          .filter(s => typeof s === 'string' && s.trim().length > 0)
          .map(s => s.trim().toUpperCase())
      : []

    // 🔧 Crear producto normalizado
    const producto = new Product({
      name: name.trim(),
      description: description.trim(),
      price,
      category: category.toLowerCase().trim(),
      subcategory: subcategory.toLowerCase().trim(),
      tallaTipo: tallaTipo.toLowerCase().trim(),
      featured,
      variants,
      images,
      color: color.trim(),
      sizes: tallasLimpias,
      createdBy: createdBy.trim()
    })

    // 📦 Guardar en base de datos
    const saved = await producto.save()
    return res.status(201).json(saved)
  } catch (error) {
    console.error('❌ Error al crear producto:', error)
    return res.status(500).json({
      message: '❌ Error interno al crear producto',
      error: error.message
    })
  }
}

module.exports = createProduct
