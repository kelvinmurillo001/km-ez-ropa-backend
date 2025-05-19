// 📁 backend/middleware/multer.js
import multer from 'multer';
import path from 'path';
import config from '../config/configuracionesito.js';
import logger from '../utils/logger.js';

/**
 * 📦 Middleware Multer
 * ➤ Subida de imágenes en memoria (Cloudinary-compatible)
 */

// 📌 Configuraciones desde entorno
const MAX_FILE_SIZE = config.maxUploadSize || 2 * 1024 * 1024; // 2MB
const ALLOWED_EXTENSIONS = config.allowedUploadExtensions || ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME_TYPES = config.allowedUploadMimeTypes || ['image/jpeg', 'image/png', 'image/webp'];

// 💾 Buffer en memoria (recomendado para Cloudinary)
const storage = multer.memoryStorage();

// 🔍 Validación personalizada del archivo
const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = file.mimetype || '';

  const isValidExtension = ALLOWED_EXTENSIONS.includes(ext);
  const isValidMime = ALLOWED_MIME_TYPES.includes(mime);

  if (isValidExtension && isValidMime) {
    return cb(null, true);
  }

  logger.warn(`⚠️ Archivo rechazado: "${file.originalname}" [ext: ${ext}, mime: ${mime}]`);

  const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
  error.message = `❌ Tipo de archivo no permitido. Solo se permiten: ${ALLOWED_EXTENSIONS.join(', ')}`;
  cb(error, false);
};

// 🧱 Middleware final: acepta solo un archivo en el campo "file"
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
}).single('file');

export default upload;
