// 📁 backend/controllers/products/getProductById.js
import mongoose from 'mongoose';
import Product from '../../models/Product.js';
import { calcularStockTotal } from '../../utils/calculateStock.js';

/**
 * 🔍 Obtener un producto por ID
 * @route   GET /api/products/:id
 * @access  Público
 */
const getProductById = async (req, res) => {
  try {
    const rawId = String(req.params.id || '').trim();

    // ✅ Validar formato de ObjectId
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ ID de producto inválido.'
      });
    }

    // 🔍 Buscar el producto
    const productoDoc = await Product.findById(rawId).select('-__v').lean();

    if (!productoDoc) {
      return res.status(404).json({
        ok: false,
        message: '❌ Producto no encontrado.'
      });
    }

    // 🧮 Calcular stock total
    const producto = {
      ...productoDoc,
      stockTotal: calcularStockTotal(productoDoc)
    };

    // 🐞 Log de desarrollo
    if (process.env.NODE_ENV !== 'production') {
      const usuario = req.user?.username || 'anónimo';
      console.log(`🔍 Producto obtenido por ID: ${producto.name} (por: ${usuario})`);
    }

    return res.status(200).json({ ok: true, data: producto });
  } catch (err) {
    console.error('❌ Error interno al obtener producto por ID:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener producto.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default getProductById;
