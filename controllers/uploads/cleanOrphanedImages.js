// 📁 backend/controllers/uploads/cleanOrphanedImages.js
import Product from '../../models/Product.js';
import { cloudinary } from '../../config/cloudinary.js';
import logger from '../../utils/logger.js';

/**
 * 🧹 DELETE /api/uploads/limpiar-huerfanas
 * ➤ Limpia imágenes en Cloudinary que no están asociadas a productos
 * @access Admin
 */
export const cleanOrphanedImages = async (req, res) => {
  try {
    // 1️⃣ Recopilar todos los cloudinaryId usados en productos
    const productos = await Product.find().select('images.cloudinaryId variants.cloudinaryId').lean();

    const usedIds = new Set();
    productos.forEach(({ images = [], variants = [] }) => {
      images.forEach(img => img?.cloudinaryId && usedIds.add(img.cloudinaryId));
      variants.forEach(v => v?.cloudinaryId && usedIds.add(v.cloudinaryId));
    });

    // 2️⃣ Buscar imágenes actuales en Cloudinary
    const folder = process.env.CLOUDINARY_FOLDER?.trim() || 'productos_kmezropa';
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    const allResources = result.resources || [];

    // 3️⃣ Filtrar imágenes huérfanas
    const orphaned = allResources.filter(r => !usedIds.has(r.public_id));
    const deleted = [];
    const failed = [];

    logger.info(`🗃️ Total imágenes en Cloudinary: ${allResources.length}`);
    logger.info(`🔍 Referencias válidas en DB: ${usedIds.size}`);
    logger.info(`🧹 Huérfanas detectadas: ${orphaned.length}`);

    // 4️⃣ Intentar eliminar cada imagen huérfana
    await Promise.allSettled(
      orphaned.map(async r => {
        try {
          const resp = await cloudinary.uploader.destroy(r.public_id);
          if (resp.result === 'ok') {
            deleted.push(r.public_id);
          } else {
            failed.push({ id: r.public_id, result: resp.result });
          }
        } catch (err) {
          failed.push({ id: r.public_id, error: err.message });
        }
      })
    );

    logger.info(`✅ Eliminadas: ${deleted.length} | ❌ Fallidas: ${failed.length}`);

    return res.status(200).json({
      ok: true,
      message: '✅ Limpieza de imágenes huérfanas completada.',
      data: {
        totalCloudinary: allResources.length,
        totalUsedInDB: usedIds.size,
        orphanedCount: orphaned.length,
        deletedCount: deleted.length,
        deleted,
        ...(failed.length > 0 && { errors: failed })
      }
    });
  } catch (err) {
    logger.error('❌ Error limpiando imágenes huérfanas:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al limpiar imágenes huérfanas.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};
