const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');
const authMiddleware = require('../middleware/authMiddleware');

// 📦 Configuración de multer para buffers
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * 📤 Subir imagen a Cloudinary
 * Ruta: POST /api/uploads
 */
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: '⚠️ No se ha enviado ninguna imagen.' });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'productos_kmezropa',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('❌ Error al subir a Cloudinary:', error);
          return res.status(500).json({ message: '❌ Error subiendo imagen a Cloudinary.' });
        }

        return res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    // ✅ Corrección: usar streamifier para enviar el buffer
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error('❌ Error en el servidor al subir imagen:', err);
    res.status(500).json({ message: '❌ Error inesperado al subir imagen.' });
  }
});

/**
 * 🗑️ Eliminar imagen en Cloudinary
 * Ruta: DELETE /api/uploads/:publicId
 */
router.delete('/:publicId', authMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: '⚠️ publicId es requerido para eliminar imagen.' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(500).json({ message: '❌ No se pudo eliminar la imagen.' });
    }

    res.status(200).json({ message: '✅ Imagen eliminada correctamente.', result });
  } catch (err) {
    console.error('❌ Error al eliminar imagen:', err);
    res.status(500).json({ message: '❌ Error inesperado al eliminar imagen.' });
  }
});

/**
 * 📃 Listar imágenes
 * Ruta: GET /api/uploads/list
 */
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:productos_kmezropa')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    const images = result.resources.map(img => ({
      url: img.secure_url,
      public_id: img.public_id,
      created_at: img.created_at
    }));

    res.json(images);
  } catch (err) {
    console.error('❌ Error al listar imágenes:', err);
    res.status(500).json({ message: '❌ Error al obtener imágenes.' });
  }
});

module.exports = router;
