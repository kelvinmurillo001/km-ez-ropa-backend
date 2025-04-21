const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const { cloudinary } = require('../config/cloudinary');

// 🛡️ Middlewares de seguridad
const authMiddleware = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// 🧹 Función para limpiar imágenes no usadas
const { cleanOrphanedImages } = require('../controllers/uploads/cleanOrphanedImages');

// 📁 Carpeta destino en Cloudinary
const CLOUDINARY_FOLDER = 'productos_kmezropa';

// 🎒 Configuración de almacenamiento y filtros para Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('❌ Solo se permiten imágenes JPG, PNG o WEBP'));
    }
    cb(null, true);
  }
});

/* -------------------------------------------------------------------------- */
/* 📤 SUBIR IMAGEN A CLOUDINARY                                               */
/* -------------------------------------------------------------------------- */
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: '⚠️ No se ha enviado ninguna imagen.' });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('❌ Error al subir a Cloudinary:', error);
          return res.status(500).json({ message: '❌ Fallo al subir la imagen.' });
        }

        return res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    console.error('❌ Error inesperado al subir imagen:', err.message);
    res.status(500).json({ message: '❌ Error inesperado al subir imagen.' });
  }
});

/* -------------------------------------------------------------------------- */
/* 🗑️ ELIMINAR IMAGEN POR PARAMS (publicId)                                   */
/* -------------------------------------------------------------------------- */
router.delete('/:publicId', authMiddleware, async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: '⚠️ Debes proporcionar el publicId de la imagen.' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (!['ok', 'not found'].includes(result.result)) {
      return res.status(500).json({ message: '❌ No se pudo eliminar la imagen.' });
    }

    res.status(200).json({ message: '✅ Imagen eliminada correctamente.', result });
  } catch (err) {
    console.error('❌ Error al eliminar imagen por publicId:', err.message);
    res.status(500).json({ message: '❌ Error del servidor al eliminar imagen.' });
  }
});

/* -------------------------------------------------------------------------- */
/* 🔘 ELIMINAR IMAGEN POR BODY (cloudinaryId)                                 */
/* -------------------------------------------------------------------------- */
router.post('/delete', authMiddleware, async (req, res) => {
  try {
    const { cloudinaryId } = req.body;

    if (!cloudinaryId) {
      return res.status(400).json({ message: '⚠️ cloudinaryId es requerido.' });
    }

    const result = await cloudinary.uploader.destroy(cloudinaryId);

    if (!['ok', 'not found'].includes(result.result)) {
      return res.status(500).json({ message: '❌ No se pudo eliminar la imagen.' });
    }

    res.json({ message: '✅ Imagen eliminada correctamente.', result });
  } catch (err) {
    console.error('❌ Error al eliminar imagen por cloudinaryId:', err.message);
    res.status(500).json({ message: '❌ Error interno al eliminar imagen.' });
  }
});

/* -------------------------------------------------------------------------- */
/* 📃 LISTAR IMÁGENES SUBIDAS A CLOUDINARY                                    */
/* -------------------------------------------------------------------------- */
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
      created_at: img.created_at
    }));

    res.json(images);
  } catch (err) {
    console.error('❌ Error al listar imágenes:', err.message);
    res.status(500).json({ message: '❌ Error al obtener imágenes.' });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧹 LIMPIAR IMÁGENES HUÉRFANAS (SOLO ADMIN)                                  */
/* -------------------------------------------------------------------------- */
router.get('/limpiar-huerfanas', authMiddleware, adminOnly, cleanOrphanedImages);

module.exports = router;
