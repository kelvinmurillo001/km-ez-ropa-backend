// 📁 backend/controllers/imageController.js
import { cloudinary } from '../config/cloudinary.js';

/**
 * 📂 Listar imágenes de Cloudinary desde una carpeta específica
 * @route   GET /api/images
 * @access  Admin
 */
export const listImages = async (req, res) => {
  try {
    const folder = process.env.CLOUDINARY_FOLDER?.trim() || 'productos_kmezropa';
    const maxResults = parseInt(process.env.CLOUDINARY_MAX_RESULTS, 10) || 100;

    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .execute();

    const images = (result.resources || []).map(img => ({
      url: img.secure_url,
      publicId: img.public_id,
      createdAt: img.created_at,
      bytes: img.bytes,
      format: img.format,
      width: img.width,
      height: img.height
    }));

    return res.status(200).json({
      ok: true,
      data: {
        folder,
        total: images.length,
        images
      }
    });
  } catch (err) {
    console.error('❌ Error listando imágenes desde Cloudinary:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al listar imágenes.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};

/**
 * 🗑️ Eliminar una imagen de Cloudinary por su publicId
 * @route   DELETE /api/images/:publicId
 * @access  Admin
 */
export const deleteImage = async (req, res) => {
  try {
    const publicId = String(req.params.publicId || '').trim();

    const validPublicId = /^[a-zA-Z0-9_\-/]+$/;
    if (!publicId || !validPublicId.test(publicId)) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ publicId inválido. Usa solo letras, números, guiones, guion bajo y slash.'
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (!result || result.result !== 'ok') {
      return res.status(404).json({
        ok: false,
        message: '⚠️ Imagen no encontrada o no pudo ser eliminada.',
        ...(process.env.NODE_ENV !== 'production' && { result })
      });
    }

    return res.status(200).json({ ok: true, data: { deleted: publicId } });
  } catch (err) {
    console.error('❌ Error eliminando imagen en Cloudinary:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar imagen.',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }
};
