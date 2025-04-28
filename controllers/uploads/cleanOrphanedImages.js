// 📁 backend/controllers/uploads/cleanOrphanedImages.js
import Product from '../../models/Product.js';
import { cloudinary } from '../../config/cloudinary.js';

/**
 * 🧹 Limpia imágenes huérfanas de Cloudinary
 * - Busca en Cloudinary las imágenes subidas
 * - Compara con los cloudinaryId utilizados en productos (images y variants)
 * - Elimina las que no se usan en la DB
 */
export const cleanOrphanedImages = async (req, res) => {
  try {
    const usedIds = new Set();

    // 🔍 Recolectar todos los cloudinaryId usados en productos
    const productos = await Product.find();
    for (const producto of productos) {
      for (const img of producto.images || []) {
        if (img.cloudinaryId) usedIds.add(img.cloudinaryId);
      }
      for (const variante of producto.variants || []) {
        if (variante.cloudinaryId) usedIds.add(variante.cloudinaryId);
      }
    }

    // 🔎 Buscar imágenes en Cloudinary (límite: 100)
    const result = await cloudinary.search
      .expression('folder:productos_kmezropa')
      .max_results(100)
      .execute();

    const huerfanas = result.resources.filter(img => !usedIds.has(img.public_id));
    const eliminadas = [];
    const fallidas = [];

    for (const img of huerfanas) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
        eliminadas.push(img.public_id);
      } catch (err) {
        console.warn(`⚠️ Error al eliminar (${img.public_id}):`, err.message);
        fallidas.push({ public_id: img.public_id, error: err.message });
      }
    }

    // 🧪 Logs solo en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🧼 Total imágenes en Cloudinary: ${result.resources.length}`);
      console.log(`🔍 Huérfanas detectadas: ${huerfanas.length}`);
      console.log(`✅ Eliminadas exitosamente: ${eliminadas.length}`);
    }

    return res.status(200).json({
      ok: true,
      message: '🧹 Limpieza de imágenes huérfanas completada',
      data: {
        totalEnCloudinary: result.resources.length,
        totalUsadasEnDB: usedIds.size,
        totalHuerfanas: huerfanas.length,
        totalEliminadas: eliminadas.length,
        eliminadas,
        ...(fallidas.length > 0 && { errores: fallidas })
      }
    });
  } catch (error) {
    console.error('❌ Error limpiando imágenes huérfanas:', error);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al limpiar imágenes huérfanas',
      error: error.message
    });
  }
};
