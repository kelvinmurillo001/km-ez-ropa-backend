// 📁 backend/controllers/products/updateProduct.js
import Product from '../../models/Product.js'
import { cloudinary } from '../../config/cloudinary.js'
import { validationResult } from 'express-validator'

/**
 * ✏️ Actualizar un producto existente
 */
const updateProduct = async (req, res) => {
  const errores = validationResult(req)
  if (!errores.isEmpty()) {
    console.warn('🛑 Errores de validación en updateProduct:', errores.array())
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
      stock // ✅ Se espera que venga si no hay variantes
    } = req.body

    const product = await Product.findById(id)
    if (!product) {
      console.warn(`🛑 Producto no encontrado - ID: ${id}`)
      return res.status(404).json({ message: '❌ Producto no encontrado' })
    }

    // =============== 📸 Imagen principal ===============
    let processedImages = product.images

    if (Array.isArray(images) && images.length === 1) {
      const [mainImage] = images
      const { url, cloudinaryId, talla, color } = mainImage

      if (!url || !cloudinaryId || !talla || !color) {
        console.warn('🛑 Imagen principal incompleta al actualizar producto')
        return res.status(400).json({
          message: '⚠️ La imagen principal requiere url, cloudinaryId, talla y color'
        })
      }

      // Eliminar anteriores de Cloudinary
      for (const img of product.images) {
        if (img.cloudinaryId) await cloudinary.uploader.destroy(img.cloudinaryId)
      }

      processedImages = [{
        url: url.trim(),
        cloudinaryId: cloudinaryId.trim(),
        talla: talla.trim().toLowerCase(),
        color: color.trim().toLowerCase()
      }]
    } else if (images.length > 1) {
      console.warn(`🛑 Se intentaron subir múltiples imágenes principales para el producto ${id}`)
      return res.status(400).json({ message: '⚠️ Solo se permite una imagen principal' })
    }

    // =============== 👕 Variantes ===============
    let processedVariants = product.variants

    if (Array.isArray(variants) && variants.length > 0) {
      if (variants.length > 4) {
        console.warn('🛑 Demasiadas variantes enviadas')
        return res.status(400).json({ message: '⚠️ Máximo 4 variantes permitidas' })
      }

      const seen = new Set()
      processedVariants = []

      // Eliminar imágenes antiguas
      for (const old of product.variants) {
        if (old.cloudinaryId) await cloudinary.uploader.destroy(old.cloudinaryId)
      }

      for (const v of variants) {
        const key = `${v.talla?.trim().toLowerCase()}-${v.color?.trim().toLowerCase()}`
        if (seen.has(key)) {
          console.warn(`🛑 Variante duplicada detectada: ${key}`)
          return res.status(400).json({ message: '⚠️ Variantes duplicadas (talla + color)' })
        }
        seen.add(key)

        if (!v.imageUrl || !v.cloudinaryId || !v.talla || !v.color || typeof v.stock !== 'number') {
          console.warn('🛑 Variante con datos incompletos:', v)
          return res.status(400).json({
            message: '⚠️ Cada variante debe tener imagen, talla, color, cloudinaryId y stock numérico'
          })
        }

        processedVariants.push({
          imageUrl: v.imageUrl.trim(),
          cloudinaryId: v.cloudinaryId.trim(),
          talla: v.talla.trim().toLowerCase(),
          color: v.color.trim().toLowerCase(),
          stock: v.stock
        })
      }
    }

    // =============== 📝 Actualizar campos básicos ===============
    if (name) product.name = name.trim()
    if (!isNaN(price)) product.price = Number(price)
    if (category) product.category = category.trim().toLowerCase()
    if (subcategory) product.subcategory = subcategory.trim().toLowerCase()
    if (tallaTipo) product.tallaTipo = tallaTipo.trim().toLowerCase()
    if (typeof color === 'string') product.color = color.trim()
    if (Array.isArray(sizes)) product.sizes = sizes.map(s => s.trim())

    product.featured = featured === true || featured === 'true'
    product.images = processedImages
    product.variants = processedVariants
    product.updatedBy = req.user?.username || 'admin'

    // ✅ Si no hay variantes, usar el stock simple
    if (!processedVariants.length) {
      if (typeof stock === 'number' && stock >= 0) {
        product.stock = stock
      } else {
        product.stock = 0
      }
    } else {
      product.stock = undefined // Evita conflictos si hay variantes
    }

    const updated = await product.save()

    console.log(`✏️ Producto actualizado correctamente - ID: ${product._id} por ${product.updatedBy}`)

    return res.status(200).json({
      message: '✅ Producto actualizado correctamente',
      producto: updated
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
