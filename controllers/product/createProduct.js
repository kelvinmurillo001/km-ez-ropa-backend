import Product from '../../models/Product.js'
import { validationResult } from 'express-validator'

/**
 * ✅ Crear nuevo producto (con o sin variantes)
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

    // 📋 Validación obligatoria de campos clave
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
      console.warn('🛑 Faltan campos obligatorios o están mal formateados.')
      return res.status(400).json({ message: '⚠️ Faltan campos obligatorios o formato inválido.' })
    }

    // 🔍 Evitar duplicados por nombre + subcategoría
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

    // 🔎 Validar variantes
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
      // ☑️ Validar stock general si no hay variantes
      stockGeneral = parseInt(stock)
      if (isNaN(stockGeneral) || stockGeneral < 0) {
        return res.status(400).json({
          message: '⚠️ Stock general inválido (solo se usa si no hay variantes).'
        })
      }
    }

    // 🔠 Normalizar tallas
    const tallasLimpias = Array.isArray(sizes)
      ? sizes.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim().toUpperCase())
      : []

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
      isActive: true // ✅ Asegurar visibilidad
    })

    const saved = await producto.save()
    console.log(`✅ Producto creado: ${saved.name} [${saved.category}/${saved.subcategory}]`)

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
