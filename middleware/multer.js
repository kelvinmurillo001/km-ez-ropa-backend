// 📁 backend/middleware/multer.js
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// 📁 Ruta para subir archivos
const uploadDir = path.resolve('uploads')

// 📂 Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true })
    console.log("📁 Carpeta 'uploads' creada correctamente")
  } catch (err) {
    console.error('❌ Error creando carpeta uploads:', err.message)
  }
}

// 🔒 Reglas de validación
const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp']
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

// 💾 Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .substring(0, 50)

    const uniqueName = `${Date.now()}-${base}${ext}`
    cb(null, uniqueName)
  }
})

// 🧪 Validación de archivos
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  const mime = file.mimetype

  if (ALLOWED_EXT.includes(ext) && ALLOWED_MIME.includes(mime)) {
    cb(null, true)
  } else {
    console.warn(`⚠️ Archivo rechazado: ${file.originalname}`)
    cb(new Error('❌ Solo se permiten imágenes JPG, PNG o WEBP'))
  }
}

// 🚀 Exportar instancia configurada
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE }
})

export default upload
