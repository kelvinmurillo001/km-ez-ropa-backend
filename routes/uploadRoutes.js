const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * 📤 Subir imagen a Cloudinary
 */
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
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
          return res.status(500).json({ message: '❌ Error subiendo imagen a Cloudinary' });
        }

        return res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error('❌ Error en el servidor al subir imagen:', err);
    res.status(500).json({ message: '❌ Error en el servidor al subir imagen' });
  }
});

/**
 * 🗑️ Eliminar imagen en Cloudinary
 */
router.delete('/:publicId', authMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: '⚠️ ID de imagen faltante para eliminar' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(500).json({ message: '❌ No se pudo eliminar la imagen' });
    }

    res.json({ message: '✅ Imagen eliminada correctamente', result });
  } catch (err) {
    console.error('❌ Error al eliminar imagen:', err);
    res.status(500).json({ message: '❌ Error del servidor al eliminar imagen' });
  }
});

module.exports = router;
