import Product from '../../models/Product.js'
import { cloudinary } from '../../config/cloudinary.js'
import { validationResult } from 'express-validator'
import { calcularStockTotal } from '../../utils/calculateStock.js'

/**
 * ✏️ Actualizar un producto existente
 */
const updateProduct = async (req, res) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    console.warn('🛑 Errores de validación:', errores.array())
    return res.status(400).json({ errors: errores.array() })
  }

  try {
    const { id } = req.params
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
      color = '',
      stock // solo si no hay variantes
    } = req.body

    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: '❌ Producto no encontrado' })
    }

    // =============== 📸 Imagen principal ===============
    let processedImages = product.images
    if (Array.isArray(images) && images.length === 1) {
      const [mainImage] = images
      const { url, cloudinaryId, talla, color: imgColor } = mainImage

      if (!url || !cloudinaryId || !talla || !imgColor) {
        return res.status(400).json({
          message: '⚠️ Imagen principal incompleta (url, cloudinaryId, talla, color)'
        })
      }

      const nuevaUrl = url.trim()
      const yaExiste = product.images[0]?.url === nuevaUrl

      if (!yaExiste) {
        for (const img of product.images) {
          if (img.cloudinaryId) await cloudinary.uploader.destroy(img.cloudinaryId)
        }

        processedImages = [{
          url: nuevaUrl,
          cloudinaryId: cloudinaryId.trim(),
          talla: talla.trim().toLowerCase(),
          color: imgColor.trim().toLowerCase()
        }]
      }
    } else if (images.length > 1) {
      return res.status(400).json({ message: '⚠️ Solo se permite una imagen principal' })
    }

    // =============== 👕 Variantes ===============
    let processedVariants = []
    if (Array.isArray(variants) && variants.length > 0) {
      if (variants.length > 4) {
        return res.status(400).json({ message: '⚠️ Máximo 4 variantes permitidas' })
      }

      const seen = new Set()
      for (const v of product.variants) {
        if (v.cloudinaryId) await cloudinary.uploader.destroy(v.cloudinaryId)
      }

      for (const v of variants) {
        const talla = v.talla?.trim().toLowerCase()
        const col = v.color?.trim().toLowerCase()
        const clave = `${talla}-${col}`

        if (!talla || !col || !v.imageUrl || !v.cloudinaryId || typeof v.stock !== 'number') {
          return res.status(400).json({
            message: '⚠️ Variante incompleta (talla, color, imagen, cloudinaryId, stock)'
          })
        }

        if (seen.has(clave)) {
          return res.status(400).json({ message: '⚠️ Variantes duplicadas (talla + color)' })
        }

        seen.add(clave)

        processedVariants.push({
          talla,
          color: col,
          imageUrl: v.imageUrl.trim(),
          cloudinaryId: v.cloudinaryId.trim(),
          stock: v.stock,
          activo: v.activo !== false
        })
      }
    }

    // =============== 🧼 Campos generales ===============
    if (name && name !== product.name) {
      product.name = name.trim()

      // 🧠 Actualizar slug si el nombre cambió
      const slugBase = name.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n').replace(/\s+/g, '-').replace(/[^\w-]/g, '')

      let slug = slugBase
      let intentos = 0
      let exists = await Product.findOne({ slug, _id: { $ne: product._id } })

      while (exists && intentos < 5) {
        slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`
        exists = await Product.findOne({ slug, _id: { $ne: product._id } })
        intentos++
      }

      if (exists) {
        return res.status(409).json({ message: '⚠️ No se pudo generar un slug único' })
      }

      product.slug = slug
    }

    if (!isNaN(price)) product.price = Number(price)
    if (category) product.category = category.trim().toLowerCase()
    if (subcategory) product.subcategory = subcategory.trim().toLowerCase()
    if (tallaTipo) product.tallaTipo = tallaTipo.trim().toLowerCase()
    if (typeof color === 'string') product.color = color.trim()
    if (Array.isArray(sizes)) product.sizes = sizes.map(s => s.trim())
    product.featured = featured === true || featured === 'true'
    product.updatedBy = req.user?.username || 'admin'

    product.images = processedImages
    product.variants = processedVariants

    // =============== 🧮 Stock lógico ===============
    if (processedVariants.length === 0) {
      product.stock = typeof stock === 'number' && stock >= 0 ? stock : 0
    } else {
      product.stock = undefined
    }

    await product.save()

    console.log(`✏️ Producto actualizado: ${product.name} (ID: ${product._id})`)

    return res.status(200).json({
      message: '✅ Producto actualizado correctamente',
      producto: {
        ...product.toObject(),
        stockTotal: calcularStockTotal(product)
      }
    })
  } catch (error) {
    console.error('❌ Error actualizando producto:', error)
    return res.status(500).json({
      message: '❌ Error interno al actualizar producto',
      error: error.message
    })
  }
}

export default updateProduct
