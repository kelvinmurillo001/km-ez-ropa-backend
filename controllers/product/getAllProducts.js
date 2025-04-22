const Product = require('../../models/Product')

/**
 * 📥 Obtener todos los productos (para catálogo o panel)
 * ✅ Filtros disponibles:
 * - nombre: búsqueda parcial (insensible a mayúsculas)
 * - categoria: exacta
 * - subcategoria: exacta
 * - precioMin / precioMax: rango
 */
const getAllProducts = async (req, res) => {
  try {
    const { nombre = '', categoria = '', subcategoria = '', precioMin, precioMax } = req.query

    const filtro = {
      name: { $exists: true, $ne: '' },
      price: { $exists: true, $gt: 0 }
    }

    // 🔍 Nombre parcial (insensible a mayúsculas)
    if (nombre.trim()) {
      filtro.name = { $regex: new RegExp(nombre.trim(), 'i') }
    }

    // 🎯 Categoría exacta
    if (categoria.trim()) {
      filtro.category = categoria.trim().toLowerCase()
    }

    // 🧩 Subcategoría exacta
    if (subcategoria.trim()) {
      filtro.subcategory = subcategoria.trim().toLowerCase()
    }

    // 💰 Precio: mínimo y/o máximo
    const min = parseFloat(precioMin)
    const max = parseFloat(precioMax)
    if (!isNaN(min) || !isNaN(max)) {
      filtro.price = {}
      if (!isNaN(min)) filtro.price.$gte = min
      if (!isNaN(max)) filtro.price.$lte = max
    }

    // 📦 Consulta con orden
    const productos = await Product.find(filtro).sort({ createdAt: -1 }).lean()

    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 Productos encontrados: ${productos.length}`)
      console.log('🧪 Filtro aplicado:', filtro)
    }

    return res.status(200).json(productos)
  } catch (error) {
    console.error('❌ Error al obtener productos:', error)
    return res.status(500).json({
      message: '❌ Error interno al obtener productos',
      error: error.message
    })
  }
}

module.exports = getAllProducts
