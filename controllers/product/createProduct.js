// 📁 backend/controllers/products/createProduct.js
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
      stock, // ✅ stock general solo si no hay variantes
      createdBy
    } = req.body

    // 📋 Validaciones obligatorias
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
      console.warn('🛑 Faltan campos obligatorios para crear producto')
      return res.status(400).json({ message: '⚠️ Faltan campos obligatorios o formato inválido.' })
    }

    // 🔍 Producto duplicado
    const existe = await Product.findOne({
      name: name.trim(),
      subcategory: subcategory.trim().toLowerCase()
    })

    if (existe) {
      console.warn(`🛑 Producto duplicado detectado: ${name} - ${subcategory}`)
      return res.status(409).json({
        message: '⚠️ Ya existe un producto con ese nombre y subcategoría.'
      })
    }

    // ✅ Imagen principal
    const [mainImage] = images
    if (!mainImage.url || !mainImage.cloudinaryId || !mainImage.talla || !mainImage.color) {
      return res.status(400).json({ message: '⚠️ Imagen principal incompleta o inválida.' })
    }

    // 🎯 Validar variantes
    if (!Array.isArray(variants)) {
      return res.status(400).json({ message: '⚠️ Formato inválido para variantes.' })
    }

    let stockGeneral = 0

    if (variants.length > 0) {
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
            message: '⚠️ Cada variante debe tener talla, color, imagen, cloudinaryId y stock numérico.'
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
      // ✅ Validar stock general si NO hay variantes
      stockGeneral = parseInt(stock)
      if (isNaN(stockGeneral) || stockGeneral < 0) {
        return res.status(400).json({
          message: '⚠️ Stock general inválido (solo se usa si no hay variantes).'
        })
      }
    }

    // 🎨 Normalizar tallas
    const tallasLimpias = Array.isArray(sizes)
      ? sizes.filter(s => typeof s === 'string' && s.trim().length > 0).map(s => s.trim().toUpperCase())
      : []

    // 📦 Crear producto
    const producto = new Product({
      name: name.trim(),
      description: description.trim(),
      price,
      category: category.toLowerCase().trim(),
      subcategory: subcategory.toLowerCase().trim(),
      tallaTipo: tallaTipo.toLowerCase().trim(),
      featured,
      variants,
      stock: stockGeneral, // solo si no hay variantes
      images,
      color: color.trim(),
      sizes: tallasLimpias,
      createdBy: createdBy.trim()
    })

    const saved = await producto.save()

    console.log(`📦 Producto creado: ${name} - ${category}/${subcategory} por ${createdBy}`)
    return res.status(201).json(saved)
  } catch (error) {
    console.error('❌ Error al crear producto:', error)
    return res.status(500).json({
      message: '❌ Error interno al crear producto',
      error: error.message
    })
  }
}

export default createProduct
