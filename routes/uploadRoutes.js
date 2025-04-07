// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

// Middleware de autenticación (opcional si solo admin puede subir)
const authMiddleware = require('../middleware/authMiddleware');

// Configurar Multer (memoria)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 📤 Ruta para subir una imagen a Cloudinary
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha enviado ninguna imagen.' });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'productos_kmezropa' },
      (error, result) => {
        if (error) {
          console.error('❌ Error al subir a Cloudinary:', error);
          return res.status(500).json({ message: 'Error subiendo la imagen' });
        }
        res.status(200).json({ url: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error('❌ Error en el servidor:', err);
    res.status(500).json({ message: 'Error en el servidor al subir imagen' });
  }
});

module.exports = router;
