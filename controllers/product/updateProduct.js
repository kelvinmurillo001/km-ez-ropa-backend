import Product from '../../models/Product.js'
import { cloudinary } from '../../config/cloudinary.js'
import { validationResult } from 'express-validator'

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
      stock // si no hay variantes
    } = req.body

    const product = await Product.findById(id)
    if (!product) {
      console.warn(`🛑 Producto no encontrado - ID: ${id}`)
      return res.status(404).json({ message: '❌ Producto no encontrado' })
    }

    // 🔄 Procesar imagen principal si viene una nueva
    let processedImages = product.images

    if (Array.isArray(images) && images.length === 1) {
      const [mainImage] = images
      const { url, cloudinaryId, talla, color: imgColor } = mainImage

      if (!url || !cloudinaryId || !talla || !imgColor) {
        return res.status(400).json({
          message: '⚠️ Imagen principal debe incluir url, cloudinaryId, talla y color'
        })
      }

      const nuevaImg = url.trim()
      const imgYaExiste = product.images[0]?.url === nuevaImg

      if (!imgYaExiste) {
        for (const img of product.images) {
          if (img.cloudinaryId) await cloudinary.uploader.destroy(img.cloudinaryId)
        }

        processedImages = [{
          url: nuevaImg,
          cloudinaryId: cloudinaryId.trim(),
          talla: talla.trim().toLowerCase(),
          color: imgColor.trim().toLowerCase()
        }]
      }
    } else if (images.length > 1) {
      return res.status(400).json({ message: '⚠️ Solo se permite una imagen principal' })
    }

    // 🎨 Procesar variantes
    let processedVariants = []
    if (Array.isArray(variants) && variants.length > 0) {
      if (variants.length > 4) {
        return res.status(400).json({ message: '⚠️ Máximo 4 variantes permitidas' })
      }

      const seen = new Set()
      for (const old of product.variants) {
        if (old.cloudinaryId) await cloudinary.uploader.destroy(old.cloudinaryId)
      }

      for (const v of variants) {
        const talla = v.talla?.trim().toLowerCase()
        const col = v.color?.trim().toLowerCase()
        const clave = `${talla}-${col}`

        if (!v.imageUrl || !v.cloudinaryId || !talla || !col || typeof v.stock !== 'number') {
          return res.status(400).json({
            message: '⚠️ Cada variante debe tener talla, color, imagen, cloudinaryId y stock numérico'
          })
        }

        if (seen.has(clave)) {
          return res.status(400).json({ message: '⚠️ Variantes duplicadas (talla + color)' })
        }

        seen.add(clave)

        processedVariants.push({
          imageUrl: v.imageUrl.trim(),
          cloudinaryId: v.cloudinaryId.trim(),
          talla,
          color: col,
          stock: v.stock
        })
      }
    }

    // 🧼 Asignar campos actualizados
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

    // 🧮 Lógica de stock
    if (processedVariants.length === 0) {
      if (typeof stock === 'number' && stock >= 0) {
        product.stock = stock
      } else {
        product.stock = 0
      }
    } else {
      product.stock = undefined // evitar duplicidad
    }

    const updated = await product.save()

    console.log(`✅ Producto actualizado: ${product.name} (ID: ${product._id}) por ${product.updatedBy}`)

    return res.status(200).json({
      message: '✅ Producto actualizado correctamente',
      producto: updated
    })
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error)
    return res.status(500).json({
      message: '❌ Error interno al actualizar producto',
      error: error.message
    })
  }
}

export default updateProduct
