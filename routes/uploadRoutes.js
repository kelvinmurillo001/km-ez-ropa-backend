// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // ✅ Usa config central
const streamifier = require('streamifier');

const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha enviado ninguna imagen.' });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'productos_kmezropa',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('❌ Error al subir a Cloudinary:', error);
          return res.status(500).json({ message: 'Error subiendo la imagen' });
        }

        return res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id // ✅ Útil para eliminar luego
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error('❌ Error en el servidor al subir imagen:', err);
    res.status(500).json({ message: 'Error en el servidor al subir imagen' });
  }
});

module.exports = router;
