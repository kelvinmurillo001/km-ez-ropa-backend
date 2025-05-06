// 📁 backend/middleware/multer.js
import multer from 'multer'
import config from '../config/configuracionesito.js'
import logger from '../utils/logger.js'

/**
 * 🧩 Middleware de Multer para manejo de uploads en memoria (Cloudinary)
 */

// 🚧 Configuración
const MAX_FILE_SIZE = config.maxUploadSize || 2 * 1024 * 1024
const ALLOWED_EXTENSIONS = config.allowedUploadExtensions || ['.jpg', '.jpeg', '.png', '.webp']
const ALLOWED_MIME_TYPES = config.allowedUploadMimeTypes || ['image/jpeg', 'image/png', 'image/webp']

// 💾 Almacenamiento en memoria (buffer para streaming)
const storage = multer.memoryStorage()

// 🧪 Validación de archivo
const fileFilter = (_req, file, cb) => {
  const ext = file.originalname.slice(((file.originalname.lastIndexOf('.') - 1) >>> 0) + 1).toLowerCase()
  const mime = file.mimetype

  const validExt = ALLOWED_EXTENSIONS.includes(`.${ext}`)
  const validMime = ALLOWED_MIME_TYPES.includes(mime)

  if (validExt && validMime) return cb(null, true)

  logger.warn(`⚠️ Archivo rechazado: ${file.originalname} [ext: .${ext}, mime: ${mime}]`)

  const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname)
  error.message = '❌ Solo se permiten imágenes JPG, PNG o WEBP de hasta 2MB'
  return cb(error, false)
}

// 🚀 Exportar instancia
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
}).single('file')

export default upload
