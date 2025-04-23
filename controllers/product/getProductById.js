// 📁 backend/controllers/products/getProductById.js
import mongoose from 'mongoose'
import Product from '../../models/Product.js'

/**
 * 🔍 Obtener un producto por su ID
 * @route GET /api/products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params

    // 🔐 Validar ID Mongo
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ El ID proporcionado no es válido',
        error: 'Formato inválido de MongoDB ObjectId'
      })
    }

    // 🔎 Buscar producto
    const producto = await Product.findById(id).lean()

    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: '❌ Producto no encontrado',
        error: 'No existe un producto con ese ID'
      })
    }

    // ✅ Encontrado (ahora con key "producto")
    return res.status(200).json({
      ok: true,
      message: '✅ Producto encontrado correctamente',
      producto
    })
  } catch (error) {
    console.error('❌ Error en getProductById:', error)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno del servidor al obtener el producto',
      error: error.message
    })
  }
}

export default getProductById
