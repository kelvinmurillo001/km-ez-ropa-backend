const Product = require('../../models/Product');
const { cloudinary } = require('../../config/cloudinary');

/**
 * 🧹 Limpia imágenes huérfanas de Cloudinary
 * - Compara los cloudinaryId usados en la DB vs los que existen en Cloudinary
 */
const cleanOrphanedImages = async (req, res) => {
  try {
    const usedIds = new Set();

    // 📦 Obtener todos los productos
    const productos = await Product.find();

    // 🔗 Recoger todos los cloudinaryId usados en productos
    for (const p of productos) {
      (p.images || []).forEach(img => {
        if (img.cloudinaryId) usedIds.add(img.cloudinaryId);
      });
      (p.variants || []).forEach(v => {
        if (v.cloudinaryId) usedIds.add(v.cloudinaryId);
      });
    }

    // 🔍 Buscar imágenes en Cloudinary (asegúrate de ajustar el folder si usas otro)
    const result = await cloudinary.search
      .expression('folder:productos_kmezropa')
      .max_results(100)
      .execute();

    const huérfanas = result.resources.filter(img => !usedIds.has(img.public_id));
    const eliminadas = [];

    for (const img of huérfanas) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
        eliminadas.push(img.public_id);
      } catch (err) {
        console.warn(`⚠️ No se pudo eliminar ${img.public_id}:`, err.message);
      }
    }

    return res.json({
      message: `🧹 Limpieza completada`,
      totalEncontradasEnCloudinary: result.resources.length,
      totalHuérfanas: huérfanas.length,
      totalEliminadas: eliminadas.length,
      eliminadas
    });

  } catch (error) {
    console.error('❌ Error limpiando imágenes huérfanas:', error);
    return res.status(500).json({
      message: '❌ Error al limpiar imágenes huérfanas',
      error: error.message
    });
  }
};

module.exports = { cleanOrphanedImages };
