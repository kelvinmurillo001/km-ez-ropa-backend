import mongoose from 'mongoose';
import Product from '../../models/Product.js';
import { calcularStockTotal } from '../../utils/calculateStock.js';
import logger from '../../utils/logger.js';

/**
 * 🔍 Obtener un producto por su ID
 * @route   GET /api/products/:id
 * @access  Público
 */
const getProductById = async (req, res) => {
  try {
    const rawId = req.params.id?.trim();

    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ El ID proporcionado no es válido.'
      });
    }

    const productoDoc = await Product.findById(rawId)
      .select('-__v')
      .lean();

    if (!productoDoc) {
      return res.status(404).json({
        ok: false,
        message: '❌ Producto no encontrado.'
      });
    }

    const producto = {
      ...productoDoc,
      stockTotal: calcularStockTotal(productoDoc)
    };

    if (process.env.NODE_ENV !== 'production') {
      const usuario = req.user?.username || 'anónimo';
      logger.debug(`🔍 Producto [${producto._id}] "${producto.name}" obtenido por ${usuario}`);
    }

    return res.status(200).json({
      ok: true,
      data: producto
    });
  } catch (err) {
    logger.error('❌ Error en getProductById:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al obtener producto.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default getProductById;
