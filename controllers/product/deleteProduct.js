import mongoose from 'mongoose';
import Product from '../../models/Product.js';
import { cloudinary } from '../../config/cloudinary.js';

/**
 * 🗑️ Eliminar un producto y sus imágenes de Cloudinary
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
const deleteProduct = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();

    // 🔍 Validar ID
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
      try {
        const resultado = await cloudinary.uploader.destroy(cloudinaryId);
        if (resultado.result === 'ok' || resultado.result === 'not found') {
          deletedCloudinaryIds.push(cloudinaryId);
        } else {
          failedDeletions.push({ tipo, cloudinaryId, error: resultado.result });
        }
      } catch (err) {
        failedDeletions.push({ tipo, cloudinaryId, error: err.message });
      }
    };

    // 🖼️ Recopilar imágenes a eliminar
    const imagenes = [];

    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.cloudinaryId) imagenes.push({ id: img.cloudinaryId, tipo: 'principal' });
      }
    }

    if (Array.isArray(product.variants)) {
      for (const v of product.variants) {
        if (v.cloudinaryId) imagenes.push({ id: v.cloudinaryId, tipo: 'variante' });
      }
    }

    // 🚮 Eliminar imágenes en paralelo
    await Promise.all(
      imagenes.map(({ id, tipo }) => eliminarDeCloudinary(id, tipo))
    );

    // 🧽 Eliminar producto de DB
    await Product.deleteOne({ _id: id });

    // ✅ Respuesta final
    const response = {
      ok: true,
      message: '✅ Producto eliminado correctamente.',
      data: {
        productId: id,
        deletedCloudinaryIds
      }
    };

    if (failedDeletions.length) {
      response.warning = '⚠️ Algunas imágenes no pudieron eliminarse.';
      response.fails = failedDeletions;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🗑️ Producto ${id} eliminado. Cloudinary: ${deletedCloudinaryIds.length} imágenes`);
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error('❌ Error interno al eliminar producto:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar producto.',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  }
};

export default deleteProduct;
