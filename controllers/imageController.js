const cloudinary = require('../config/cloudinary');

const listImages = async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:productos_kmezropa')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    const images = result.resources.map(img => ({
      url: img.secure_url,
      public_id: img.public_id
    }));

    res.json(images);
  } catch (error) {
    console.error('❌ Error listando imágenes:', error.message);
    res.status(500).json({ message: 'Error listando imágenes' });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: 'ID de imagen requerido' });
    }

    await cloudinary.uploader.destroy(publicId);
    res.json({ message: '✅ Imagen eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error.message);
    res.status(500).json({ message: 'Error al eliminar imagen' });
  }
};

module.exports = {
  listImages,
  deleteImage
};
