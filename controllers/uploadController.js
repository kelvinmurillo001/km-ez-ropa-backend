// 📁 backend/controllers/uploadController.js
import streamifier from 'streamifier';
import { cloudinary } from '../config/cloudinary.js';
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

/**
 * 📤 Subir imagen a Cloudinary
 * @route   POST /api/uploads/image
 * @access  Admin
 */
export const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    // 📛 Validar archivo presente
    if (!file?.buffer) {
      logger.warn('📭 Subida fallida: archivo no proporcionado.');
      return res.status(400).json({
        ok: false,
        message: '⚠️ No se ha proporcionado ningún archivo de imagen.'
      });
    }

    // 🧪 Validar tipo MIME
    if (!file.mimetype?.startsWith('image/')) {
      logger.warn(`⛔ Tipo MIME inválido: ${file.mimetype}`);
      return res.status(400).json({
        ok: false,
        message: '⚠️ Solo se permiten archivos de imagen.'
      });
    }

    // 🧪 Validar tamaño del archivo
    const maxSizeMb = config.maxUploadSizeMb || 5;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      logger.warn(`⛔ Archivo excede límite: ${file.size} bytes`);
      return res.status(413).json({
        ok: false,
        message: `⚠️ Tamaño máximo permitido: ${maxSizeMb}MB.`
      });
    }

    // 📁 Validar carpeta de destino
    const folderSolicitada = String(req.body.folder || config.defaultUploadFolder || 'otros').trim().toLowerCase();
    const carpetasPermitidas = Array.isArray(config.allowedUploadFolders)
      ? config.allowedUploadFolders.map(f => f.toLowerCase())
      : ['productos_kmezropa', 'promos', 'otros'];

    const folder = carpetasPermitidas.includes(folderSolicitada)
      ? folderSolicitada
      : (config.defaultUploadFolder || 'otros');

    // ☁️ Subir a Cloudinary vía stream
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      streamifier.createReadStream(file.buffer).pipe(stream);
    });

    logger.info(`✅ Imagen subida a Cloudinary`, {
      folder,
      url: uploadResult.secure_url,
      id: uploadResult.public_id
    });

    return res.status(200).json({
      ok: true,
      message: '✅ Imagen subida correctamente.',
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        folder
      }
    });
  } catch (err) {
    logger.error('❌ Error al subir imagen:', err);
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al subir imagen.',
      ...(config.env !== 'production' && { error: err.message })
    });
  }
};
