import mongoose from 'mongoose'
import Product from '../../models/Product.js'
import { calcularStockTotal } from '../../utils/calculateStock.js'

/**
 * 🔍 Obtener un producto por ID
 * @route GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ El ID proporcionado no es válido',
        error: 'Formato inválido de MongoDB ObjectId'
      })
    }

    const producto = await Product.findById(id).lean()

    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: '❌ Producto no encontrado',
        error: 'No existe un producto con ese ID'
      })
    }

    // ✅ Calcular stock total usando helper
    const stockTotal = calcularStockTotal(producto)

    console.log(`🔍 Producto obtenido: ${producto.name} (ID: ${id}) [Usuario: ${req.user?.username || 'público'}]`)

    return res.status(200).json({
      ok: true,
      message: '✅ Producto encontrado correctamente',
      producto: {
        ...producto,
        stockTotal
      }
    })
  } catch (error) {
    console.error('❌ Error al obtener producto por ID:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener producto',
      error: error.message
    })
  }
}

export default getProductById
