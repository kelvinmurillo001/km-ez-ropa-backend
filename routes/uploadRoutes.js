// 📁 routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary.js';

// 🛡️ Middlewares
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';

// 📂 Controladores
import { cleanOrphanedImages } from '../controllers/uploads/cleanOrphanedImages.js';

const router = express.Router();
const CLOUDINARY_FOLDER = 'productos_kmezropa';

/* ─────────── MULTER CONFIG ─────────── */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('❌ Solo se permiten imágenes JPG, PNG o WEBP'));
    }
    cb(null, true);
  }
});

/* ─────────── RUTAS ─────────── */

// 📤 SUBIR IMAGEN
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: '⚠️ No se ha enviado ninguna imagen.' });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.error('❌ Error Cloudinary al subir:', error);
          return res.status(500).json({ message: '❌ Fallo al subir la imagen.' });
        }

        return res.status(200).json({
          message: '✅ Imagen subida correctamente',
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error('❌ Excepción al subir imagen:', err.message);
    res.status(500).json({ message: '❌ Error inesperado al subir imagen.' });
  }
});

// 🗑️ ELIMINAR IMAGEN por param
router.delete('/:publicId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const publicId = req.params.publicId?.trim();

    if (!publicId || !/^[\w\-\/]+$/.test(publicId)) {
      return res.status(400).json({ message: '⚠️ publicId inválido.' });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    if (!['ok', 'not found'].includes(result.result)) {
      return res.status(500).json({ message: '❌ No se pudo eliminar la imagen.' });
    }

    return res.status(200).json({ message: '✅ Imagen eliminada.', publicId, result });
  } catch (err) {
    console.error('❌ Excepción al eliminar imagen:', err.message);
    res.status(500).json({ message: '❌ Error interno al eliminar imagen.' });
  }
});

// 🗑️ ELIMINAR IMAGEN por body
router.post('/delete', authMiddleware, adminOnly, async (req, res) => {
  try {
    const cloudinaryId = req.body.cloudinaryId?.trim();

    if (!cloudinaryId || cloudinaryId.length < 8 || !/^[\w\-\/]+$/.test(cloudinaryId)) {
      return res.status(400).json({ message: '⚠️ cloudinaryId inválido.' });
    }

    const result = await cloudinary.uploader.destroy(cloudinaryId);
    if (!['ok', 'not found'].includes(result.result)) {
      return res.status(500).json({ message: '❌ No se pudo eliminar la imagen.' });
    }

    return res.status(200).json({ message: '✅ Imagen eliminada.', cloudinaryId, result });
  } catch (err) {
    console.error('❌ Error en POST /delete:', err.message);
    res.status(500).json({ message: '❌ Error interno al eliminar imagen.' });
  }
});

// 📃 LISTAR IMÁGENES (solo admin)
router.get('/list', authMiddleware, adminOnly, async (req, res) => {
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
      bytes: img.bytes
    }));

    return res.status(200).json({ total: images.length, images });
  } catch (err) {
    console.error('❌ Error al listar imágenes:', err.message);
    res.status(500).json({ message: '❌ Error al obtener imágenes.' });
  }
});

// 🧹 LIMPIAR HUÉRFANAS (admin)
router.get('/limpiar-huerfanas', authMiddleware, adminOnly, cleanOrphanedImages);

export default router;
