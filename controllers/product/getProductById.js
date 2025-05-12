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

    // ✅ Validar formato de ID
    if (!rawId || !mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ ID de producto inválido.'
      });
    }

    // 🔎 Buscar producto
    const productoDoc = await Product.findById(rawId)
      .select('-__v')
      .lean();

    if (!productoDoc) {
      return res.status(404).json({
        ok: false,
        message: '❌ Producto no encontrado.'
      });
    }

    // 📦 Agregar stock calculado
    const producto = {
      ...productoDoc,
      stockTotal: calcularStockTotal(productoDoc)
    };

    // 🧾 Log de depuración
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `🔍 Producto cargado: ${producto.name} (ID: ${rawId})` +
        (req.user ? ` [por: ${req.user.username}]` : ' [acceso público]')
      );
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
