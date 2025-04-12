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

    // 🔗 Recoger todos los cloudinaryId usados
    for (const p of productos) {
      (p.images || []).forEach(img => {
        if (img.cloudinaryId) usedIds.add(img.cloudinaryId);
      });
      (p.variants || []).forEach(v => {
        if (v.cloudinaryId) usedIds.add(v.cloudinaryId);
      });
    }

    // 🔍 Buscar imágenes en Cloudinary (cambia el folder si es necesario)
    const result = await cloudinary.search
      .expression('folder:productos_kmezropa')
      .max_results(100)
      .execute();

    const huérfanas = result.resources.filter(img => !usedIds.has(img.public_id));
    const eliminadas = [];

    for (const img of huérfanas) {
      await cloudinary.uploader.destroy(img.public_id);
      eliminadas.push(img.public_id);
    }

    return res.json({
      message: `🧹 Limpieza completada`,
      totalEliminadas: eliminadas.length,
      eliminadas
    });

  } catch (error) {
    console.error('❌ Error limpiando imágenes huérfanas:', error.message);
    return res.status(500).json({ message: '❌ Error al limpiar imágenes huérfanas' });
  }
};

module.exports = { cleanOrphanedImages };
