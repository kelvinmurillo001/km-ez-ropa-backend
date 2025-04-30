import Product from '../../models/Product.js'

/**
 * 📥 Obtener todos los productos (para catálogo o panel) con filtros + paginación
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      nombre = '',
      categoria = '',
      subcategoria = '',
      precioMin,
      precioMax,
      featured,
      pagina = 1,
      limite = 12
    } = req.query

    const filtro = {
      isActive: true,
      price: { $exists: true, $gt: 0 },
      $or: [
        { variants: { $elemMatch: { stock: { $gt: 0 } } } },
        { stock: { $gt: 0 } }
      ]
    }

    if (nombre.trim()) {
      filtro.name = { $regex: new RegExp(nombre.trim(), 'i') }
    }

    if (categoria.trim()) {
      filtro.category = categoria.trim().toLowerCase()
    }

    if (subcategoria.trim()) {
      filtro.subcategory = subcategoria.trim().toLowerCase()
    }

    if (featured === 'true') {
      filtro.featured = true
    }

    const min = parseFloat(precioMin)
    const max = parseFloat(precioMax)
    if (!isNaN(min) || !isNaN(max)) {
      filtro.price = {}
      if (!isNaN(min)) filtro.price.$gte = min
      if (!isNaN(max)) filtro.price.$lte = max
    }

    const page = Math.max(parseInt(pagina), 1)
    const limit = Math.min(Math.max(parseInt(limite), 1), 50)
    const skip = (page - 1) * limit

    const [productos, total] = await Promise.all([
      Product.find(filtro)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filtro)
    ])

    const productosConStock = productos.map(p => {
      let stockTotal = 0
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        stockTotal = p.variants.reduce((a, v) => a + (v.stock || 0), 0)
      } else if (typeof p.stock === 'number') {
        stockTotal = p.stock
      }
      return { ...p, stockTotal }
    })

    const totalPaginas = Math.ceil(total / limit)

    console.log(`📦 Productos encontrados: ${productos.length} | Total: ${total}`)

    return res.status(200).json({
      productos: productosConStock,
      total,
      pagina: page,
      totalPaginas
    })
  } catch (error) {
    console.error('❌ Error al obtener productos:', error)
    return res.status(500).json({
      message: '❌ Error interno al obtener productos',
      error: error.message
    })
  }
}

export default getAllProducts
