const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');
const authMiddleware = require('../middleware/authMiddleware');

// 📂 Carpeta centralizada de Cloudinary
const CLOUDINARY_FOLDER = 'productos_kmezropa';

// 📦 Configuración de multer para recibir buffer (no archivo en disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * 📤 SUBIR imagen a Cloudinary
 * Ruta: POST /api/uploads
 */
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
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

    // ✅ Convertir buffer a stream y enviarlo
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    console.error('❌ Error inesperado al subir imagen:', err);
    res.status(500).json({ message: '❌ Error inesperado al subir imagen.' });
  }
});

/**
 * 🗑️ ELIMINAR imagen por publicId
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
 * 🔘 ELIMINAR imagen (POST con cloudinaryId) — para frontend dinámico
 * Ruta: POST /api/uploads/delete
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
 * 📃 LISTAR imágenes del folder
 * Ruta: GET /api/uploads/list
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

module.exports = router;
