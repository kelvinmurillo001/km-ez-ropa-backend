import Product from '../../models/Product.js'

/**
 * 📥 Obtener productos con filtros avanzados y stock real
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

    // 🧹 Filtro base
    const filtro = {
      isActive: true,
      price: { $exists: true, $gt: 0 }
    }

    // 🎯 Filtros dinámicos
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

    // 💲 Filtro de rango de precios
    const min = parseFloat(precioMin)
    const max = parseFloat(precioMax)
    if (!isNaN(min) || !isNaN(max)) {
      filtro.price = {}
      if (!isNaN(min)) filtro.price.$gte = min
      if (!isNaN(max)) filtro.price.$lte = max
    }

    // 📄 Paginación segura
    const page = Math.max(parseInt(pagina) || 1, 1)
    const limit = Math.min(Math.max(parseInt(limite) || 12, 1), 50)
    const skip = (page - 1) * limit

    // ⚙️ Obtener todos los productos antes de filtrar por stock
    const [productosSinStock, totalBruto] = await Promise.all([
      Product.find(filtro).sort({ createdAt: -1 }).lean(),
      Product.countDocuments(filtro)
    ])

    // 🔎 Calcular stock total (base + variantes activas)
    const productosConStock = productosSinStock
      .map(p => {
        const stockBase = typeof p.stock === 'number' ? p.stock : 0
        const stockVariantes = Array.isArray(p.variants)
          ? p.variants
              .filter(v => v?.activo !== false)
              .reduce((acc, v) => acc + (v.stock || 0), 0)
          : 0

        const stockTotal = stockBase + stockVariantes
        return { ...p, stockTotal }
      })
      .filter(p => p.stockTotal > 0)

    // 🔁 Paginación post-filtrado
    const total = productosConStock.length
    const totalPaginas = Math.ceil(total / limit)
    const productosPaginados = productosConStock.slice(skip, skip + limit)

    console.log(`📦 Productos válidos con stock: ${productosPaginados.length} de ${totalBruto} encontrados (total: ${total})`)

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
