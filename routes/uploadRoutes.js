const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const { cloudinary } = require('../config/cloudinary');
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');
const { cleanOrphanedImages } = require('../controllers/uploads/cleanOrphanedImages');

// 📂 Carpeta central de imágenes
const CLOUDINARY_FOLDER = 'productos_kmezropa';

// 📦 Multer en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * 📤 SUBIR imagen a Cloudinary
 * POST /api/uploads
 */
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: '⚠️ No se ha enviado ninguna imagen.' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('❌ Error al subir a Cloudinary:', error);
          return res.status(500).json({ message: '❌ Error subiendo imagen a Cloudinary.' });
        }

        return res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    console.error('❌ Error inesperado al subir imagen:', err);
    res.status(500).json({ message: '❌ Error inesperado al subir imagen.' });
  }
});

/**
 * 🗑️ ELIMINAR imagen por publicId
 * DELETE /api/uploads/:publicId
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
 * 🔘 ELIMINAR imagen por body.cloudinaryId
 * POST /api/uploads/delete
 */
router.post('/delete', authMiddleware, async (req, res) => {
  try {
    const { cloudinaryId } = req.body;

    if (!cloudinaryId) {
      return res.status(400).json({ message: '⚠️ cloudinaryId es requerido para eliminar imagen.' });
    }

    const result = await cloudinary.uploader.destroy(cloudinaryId);

    if (result.result === 'ok' || result.result === 'not found') {
      return res.json({ message: '✅ Imagen eliminada correctamente.', result });
    }

    res.status(500).json({ message: '❌ No se pudo eliminar la imagen.' });
  } catch (err) {
    console.error('❌ Error en eliminación por cloudinaryId:', err);
    res.status(500).json({ message: '❌ Error del servidor al eliminar imagen.' });
  }
});

/**
 * 📃 LISTAR imágenes
 * GET /api/uploads/list
 */
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression(`folder:${CLOUDINARY_FOLDER}`)
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    const images = result.resources.map(img => ({
      url: img.secure_url,
      public_id: img.public_id,
      created_at: img.created_at,
    }));

    res.json(images);
  } catch (err) {
    console.error('❌ Error al listar imágenes:', err);
    res.status(500).json({ message: '❌ Error al obtener imágenes.' });
  }
});

/**
 * 🧹 LIMPIAR imágenes huérfanas
 * GET /api/uploads/limpiar-huerfanas
 */
router.get('/limpiar-huerfanas', authMiddleware, adminOnly, cleanOrphanedImages);

module.exports = router;
