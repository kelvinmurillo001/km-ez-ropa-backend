// 📁 backend/controllers/products/deleteProduct.js
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

    // 🔎 Buscar producto
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ ok: false, message: '❌ Producto no encontrado.' });
    }

    const deletedCloudinaryIds = [];
    const failedDeletions = [];

    // 🧹 Función para eliminar imagen de Cloudinary
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

    // 🖼️ Recopilar IDs de imágenes a eliminar
    const imagenes = [
      ...(Array.isArray(product.images) ? product.images.map(img => ({ id: img.cloudinaryId, tipo: 'principal' })) : []),
      ...(Array.isArray(product.variants) ? product.variants.map(v => ({ id: v.cloudinaryId, tipo: 'variante' })) : [])
    ].filter(img => img.id);

    // 🚮 Eliminar imágenes en paralelo
    await Promise.all(imagenes.map(({ id, tipo }) => eliminarDeCloudinary(id, tipo)));

    // 🧽 Eliminar producto de la base de datos
    await Product.deleteOne({ _id: id });

    // 📤 Respuesta final
    const response = {
      ok: true,
      message: '✅ Producto eliminado correctamente.',
      data: {
        productId: id,
        deletedCloudinaryIds
      }
    };

    if (failedDeletions.length > 0) {
      response.warning = '⚠️ Algunas imágenes no pudieron eliminarse.';
      response.errors = failedDeletions;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🗑️ Producto eliminado: ${id} | Imágenes eliminadas: ${deletedCloudinaryIds.length}`);
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar producto.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

export default deleteProduct;
