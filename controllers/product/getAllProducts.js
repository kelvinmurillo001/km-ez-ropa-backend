import Product from '../../models/Product.js'
import { calcularStockTotal } from '../../utils/calculateStock.js'

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

    const min = parseFloat(precioMin)
    const max = parseFloat(precioMax)
    if (Number.isFinite(min) || Number.isFinite(max)) {
      filtro.price = {}
      if (Number.isFinite(min)) filtro.price.$gte = min
      if (Number.isFinite(max)) filtro.price.$lte = max
    }

    const page = Math.max(parseInt(pagina) || 1, 1)
    const limit = Math.min(Math.max(parseInt(limite) || 12, 1), 50)
    const skip = (page - 1) * limit

    const [productosRaw, totalBruto] = await Promise.all([
      Product.find(filtro).sort({ createdAt: -1 }).lean(),
      Product.countDocuments(filtro)
    ])

    const productosConStock = productosRaw
      .map(p => ({ ...p, stockTotal: calcularStockTotal(p) }))
      .filter(p => p.stockTotal > 0)

    const total = productosConStock.length
    const totalPaginas = limit > 0 ? Math.ceil(total / limit) : 1
    const productosPaginados = productosConStock.slice(skip, skip + limit)

    console.log(`📦 Productos con stock: ${productosPaginados.length} de ${totalBruto} encontrados (visibles: ${total})`)

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
