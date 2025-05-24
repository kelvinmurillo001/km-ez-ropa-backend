import mongoose from 'mongoose';
import Product from '../../models/Product.js';
import { cloudinary } from '../../config/cloudinary.js';
import logger from '../../utils/logger.js';

/**
 * 🗑️ Eliminar un producto y sus imágenes de Cloudinary
 * @route DELETE /api/products/:id
 * @access Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id?.trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de producto inválido.' });
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ ok: false, message: '❌ Producto no encontrado.' });
    }

    const deletedCloudinaryIds = [];
    const failedDeletions = [];

    const eliminarDeCloudinary = async (cloudinaryId, tipo) => {
      if (!cloudinaryId) return;
      try {
        const resultado = await cloudinary.uploader.destroy(cloudinaryId);
        if (['ok', 'not found'].includes(resultado.result)) {
          deletedCloudinaryIds.push(cloudinaryId);
        } else {
          failedDeletions.push({ tipo, cloudinaryId, error: resultado.result });
        }
      } catch (err) {
        failedDeletions.push({ tipo, cloudinaryId, error: err.message });
      }
    };

    const imagenes = [
      ...(product.images?.map(img => ({ id: img.cloudinaryId, tipo: 'principal' })) || []),
      ...(product.variants?.map(v => ({ id: v.cloudinaryId, tipo: 'variante' })) || [])
    ].filter(img => img.id);

    await Promise.all(imagenes.map(({ id, tipo }) => eliminarDeCloudinary(id, tipo)));

    await Product.deleteOne({ _id: id });

    const response = {
      ok: true,
      message: '✅ Producto eliminado correctamente.',
      data: {
        productId: id,
        deletedCloudinaryIds
      }
    };

    if (failedDeletions.length > 0) {
      response.warning = '⚠️ Algunas imágenes no se eliminaron correctamente.';
      response.errors = failedDeletions;
      logger.warn(`⚠️ Imágenes no eliminadas en producto ${id}:`, failedDeletions);
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`🗑️ Producto eliminado: ${id} | Imágenes eliminadas: ${deletedCloudinaryIds.length}`);
    }

    return res.status(200).json(response);
  } catch (err) {
    logger.error('❌ Error interno al eliminar producto:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar producto.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default deleteProduct;
