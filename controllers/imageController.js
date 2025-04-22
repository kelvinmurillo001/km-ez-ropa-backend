const { cloudinary } = require('../config/cloudinary');

/**
 * 📂 Listar imágenes de Cloudinary (carpeta productos_kmezropa)
 * @route GET /api/images
 */
const listImages = async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:productos_kmezropa')
      .sort_by('created_at', 'desc')
      .max_results(100) // máximo permitido por Cloudinary
      .execute();

    const imageList = result.resources.map(img => ({
      url: img.secure_url,
      public_id: img.public_id,
      created_at: img.created_at,
      bytes: img.bytes
    }));

    return res.status(200).json({
      ok: true,
      message: '✅ Imágenes obtenidas correctamente',
      data: {
        total: imageList.length,
        images: imageList
      }
    });

  } catch (error) {
    console.error('❌ Error listando imágenes desde Cloudinary:', error);
    return res.status(500).json({
      ok: false,
      message: '❌ Error al obtener imágenes desde Cloudinary',
      error: error.message
    });
  }
};

/**
 * 🗑️ Eliminar una imagen específica por su public_id
 * @route DELETE /api/images/:publicId
 */
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId || typeof publicId !== 'string' || publicId.trim().length < 3) {
      return res.status(400).json({
        ok: false,
        message: '⚠️ Se requiere un public_id válido de la imagen.'
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return res.status(404).json({
        ok: false,
        message: '⚠️ No se pudo eliminar la imagen. Verifica el ID proporcionado.',
        result
      });
    }

    return res.status(200).json({
      ok: true,
      message: '✅ Imagen eliminada correctamente',
      data: {
        publicId
      }
    });

  } catch (error) {
    console.error('❌ Error al eliminar imagen desde Cloudinary:', error);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al eliminar imagen',
      error: error.message
    });
  }
};

module.exports = {
  listImages,
  deleteImage
};
