// 📁 backend/controllers/products/getProductBySlug.js
import Product from '../../models/Product.js'
import { calcularStockTotal } from '../../utils/calculateStock.js'

/**
 * 🔍 Obtener un producto por slug
 * @route GET /api/products/slug/:slug
 */
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({
        ok: false,
        message: '❌ Slug no proporcionado o inválido',
      })
    }

    const producto = await Product.findOne({ slug }).lean()

    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: '❌ Producto no encontrado con ese slug',
      })
    }

    // Calcular stock total si es necesario
    const stockTotal = calcularStockTotal(producto)

    console.log(`🔍 Producto obtenido por slug: ${slug}`)

    return res.status(200).json({
      ok: true,
      message: '✅ Producto encontrado correctamente',
      producto: {
        ...producto,
        stockTotal,
      }
    })
  } catch (error) {
    console.error('❌ Error al obtener producto por slug:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener producto por slug',
      error: error.message,
    })
  }
}

export default getProductBySlug
