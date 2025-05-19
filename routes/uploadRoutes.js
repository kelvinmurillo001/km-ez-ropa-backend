// 📁 backend/routes/uploadRoutes.js
import express from 'express';
import multer from 'multer';
import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary.js';
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

// 🛡️ Seguridad
import authMiddleware from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';

// 📂 Controlador auxiliar
import { cleanOrphanedImages } from '../controllers/uploads/cleanOrphanedImages.js';

const router = express.Router();

/* ─────────── MULTER CONFIG ─────────── */
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: (config.maxUploadSizeMb || 2) * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('❌ Solo se permiten imágenes JPG, PNG, WEBP, GIF, AVIF.'));
    }
    cb(null, true);
  }
});

/* ───────────────────────────────────────────── */
/* 📤 SUBIR IMAGEN                               */
/* @route POST /api/uploads                      */
/* @access Admin                                  */
/* ───────────────────────────────────────────── */
router.post(
  '/',
  authMiddleware,
  adminOnly,
  upload.single('image'),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file?.buffer) {
        return res.status(400).json({ ok: false, message: '⚠️ No se envió ninguna imagen.' });
      }

      const folder = String(req.body.folder || config.defaultUploadFolder || 'otros').toLowerCase().trim();
      const validFolders = config.allowedUploadFolders || ['productos_kmezropa', 'promos', 'otros'];

      if (!validFolders.includes(folder)) {
        return res.status(400).json({ ok: false, message: '⚠️ Carpeta no permitida.' });
      }

      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true
        },
        (error, result) => {
          if (error) {
            logger.error('❌ Error Cloudinary:', error);
            return res.status(500).json({ ok: false, message: '❌ Fallo al subir la imagen.' });
          }

          return res.status(200).json({
            ok: true,
            message: '✅ Imagen subida correctamente.',
            data: {
              url: result.secure_url,
              publicId: result.public_id,
              folder
            }
          });
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
    } catch (err) {
      logger.error('❌ Excepción al subir imagen:', err);
      return res.status(500).json({ ok: false, message: '❌ Error interno al subir imagen.' });
    }
  }
);

/* ───────────────────────────────────────────── */
/* 🗑️ ELIMINAR IMAGEN (por parámetro URL)        */
/* @route DELETE /api/uploads/:publicId          */
/* ───────────────────────────────────────────── */
router.delete('/:publicId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const publicId = req.params.publicId?.trim();
    if (!publicId || !/^[\w\-\/]+$/.test(publicId)) {
      return res.status(400).json({ ok: false, message: '⚠️ publicId inválido.' });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    if (!['ok', 'not found'].includes(result.result)) {
      return res.status(500).json({ ok: false, message: '❌ No se pudo eliminar la imagen.' });
    }

    return res.status(200).json({ ok: true, message: '✅ Imagen eliminada.', data: { publicId } });
  } catch (err) {
    logger.error('❌ Error eliminando imagen:', err);
    return res.status(500).json({ ok: false, message: '❌ Error interno al eliminar imagen.' });
  }
});

/* ───────────────────────────────────────────── */
/* 🗑️ ELIMINAR IMAGEN (por body cloudinaryId)    */
/* @route POST /api/uploads/delete               */
/* ───────────────────────────────────────────── */
router.post('/delete', authMiddleware, adminOnly, async (req, res) => {
  try {
    const cloudinaryId = req.body.cloudinaryId?.trim();
    if (!cloudinaryId || !/^[\w\-\/]+$/.test(cloudinaryId)) {
      return res.status(400).json({ ok: false, message: '⚠️ cloudinaryId inválido.' });
    }

    const result = await cloudinary.uploader.destroy(cloudinaryId);
    if (!['ok', 'not found'].includes(result.result)) {
      return res.status(500).json({ ok: false, message: '❌ No se pudo eliminar la imagen.' });
    }

    return res.status(200).json({ ok: true, message: '✅ Imagen eliminada.', data: { cloudinaryId } });
  } catch (err) {
    logger.error('❌ Error en POST /delete:', err);
    return res.status(500).json({ ok: false, message: '❌ Error interno al eliminar imagen.' });
  }
});

/* ───────────────────────────────────────────── */
/* 📃 LISTAR IMÁGENES DE UNA CARPETA             */
/* @route GET /api/uploads/list                  */
/* ───────────────────────────────────────────── */
router.get('/list', authMiddleware, adminOnly, async (_req, res) => {
  try {
    const folder = config.defaultUploadFolder || 'productos_kmezropa';
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    const images = result.resources.map(img => ({
      url: img.secure_url,
      publicId: img.public_id,
      createdAt: img.created_at,
      bytes: img.bytes
    }));

    return res.status(200).json({ ok: true, total: images.length, data: images });
  } catch (err) {
    logger.error('❌ Error al listar imágenes:', err);
    return res.status(500).json({ ok: false, message: '❌ Error al obtener imágenes.' });
  }
});

/* ───────────────────────────────────────────── */
/* 🧹 LIMPIAR IMÁGENES HUÉRFANAS                 */
/* @route GET /api/uploads/limpiar-huerfanas     */
/* ───────────────────────────────────────────── */
router.get('/limpiar-huerfanas', authMiddleware, adminOnly, cleanOrphanedImages);

export default router;
