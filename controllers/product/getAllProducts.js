// backend/controllers/product/getAllProducts.js
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

    // Filtro base sin validar stock todavía
    const filtro = {
      isActive: true,
      price: { $exists: true, $gt: 0 }
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

    // Obtener productos base sin filtrar por stock
    const [productosSinFiltrar, totalBruto] = await Promise.all([
      Product.find(filtro)
        .sort({ createdAt: -1 })
        .lean(),
      Product.countDocuments(filtro)
    ])

    // Filtrar por stock total real (principal + variantes activas)
    const productosConStock = productosSinFiltrar
      .map(p => {
        const stockPrincipal = typeof p.stock === 'number' ? p.stock : 0
        const stockVariantes = Array.isArray(p.variants)
          ? p.variants
              .filter(v => v.activo !== false)
              .reduce((total, v) => total + (v.stock || 0), 0)
          : 0

        const stockTotal = stockPrincipal + stockVariantes
        return { ...p, stockTotal }
      })
      .filter(p => p.stockTotal > 0)

    // Paginación manual después del filtrado
    const total = productosConStock.length
    const totalPaginas = Math.ceil(total / limit)
    const productosPaginados = productosConStock.slice(skip, skip + limit)

    console.log(`📦 Productos válidos con stock: ${productosPaginados.length} | Total: ${total}`)

    return res.status(200).json({
      productos: productosPaginados,
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
