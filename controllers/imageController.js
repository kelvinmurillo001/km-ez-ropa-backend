const cloudinary = require('../config/cloudinary');

/**
 * 📂 Listar imágenes desde la carpeta de productos en Cloudinary
 */
const listImages = async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:productos_kmezropa')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    const imageList = result.resources.map(img => ({
      url: img.secure_url,
      public_id: img.public_id,
      created_at: img.created_at,
      bytes: img.bytes
    }));

    res.json({ total: imageList.length, images: imageList });
  } catch (error) {
    console.error('❌ Error listando imágenes:', error.message || error);
    res.status(500).json({ message: '❌ Error al obtener imágenes desde Cloudinary' });
  }
};

/**
 * ❌ Eliminar una imagen específica por su public_id
 */
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId || typeof publicId !== 'string') {
      return res.status(400).json({ message: '⚠️ Se requiere un public_id válido de la imagen' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      return res.status(500).json({ message: '⚠️ No se pudo eliminar la imagen. Verifica el ID.' });
    }

    res.json({ message: '✅ Imagen eliminada correctamente', publicId });
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error.message || error);
    res.status(500).json({ message: '❌ Error al eliminar imagen desde Cloudinary' });
  }
};

module.exports = {
  listImages,
  deleteImage
};
