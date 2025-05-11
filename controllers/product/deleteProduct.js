// 📁 backend/controllers/product/deleteProduct.js
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

    // 🔎 Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: '⚠️ ID de producto inválido.' });
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ ok: false, message: '❌ Producto no encontrado.' });
    }

    const deletedCloudinaryIds = [];
    const failedDeletions = [];

    // 🔁 Auxiliar para eliminar imagen
    const deleteFromCloudinary = async (cloudinaryId, tipo) => {
      try {
        const result = await cloudinary.uploader.destroy(cloudinaryId);
        if (result.result === 'ok') {
          deletedCloudinaryIds.push(cloudinaryId);
        } else {
          failedDeletions.push({ cloudinaryId, tipo, result: result.result });
        }
      } catch (err) {
        failedDeletions.push({ cloudinaryId, tipo, error: err.message });
      }
    };

    // 📂 Recolectar imágenes a eliminar
    const imagenesAEliminar = [];

    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.cloudinaryId) imagenesAEliminar.push({ id: img.cloudinaryId, tipo: 'principal' });
      }
    }

    if (Array.isArray(product.variants)) {
      for (const v of product.variants) {
        if (v.cloudinaryId) imagenesAEliminar.push({ id: v.cloudinaryId, tipo: 'variante' });
      }
    }

    // 🧹 Eliminar todas las imágenes en paralelo
    await Promise.all(
      imagenesAEliminar.map(({ id, tipo }) => deleteFromCloudinary(id, tipo))
    );

    // ❌ Eliminar producto de MongoDB
    await Product.deleteOne({ _id: id });

    // ✅ Respuesta
    const response = {
      ok: true,
      message: '✅ Producto eliminado correctamente.',
      data: {
        productId: id,
        deletedCloudinaryIds
      }
    };

    if (failedDeletions.length) {
      response.warning = '⚠️ Algunas imágenes no se pudieron eliminar.';
      response.failed = failedDeletions;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🧾 Producto eliminado: ${id}, Imágenes eliminadas: ${deletedCloudinaryIds.length}`);
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
