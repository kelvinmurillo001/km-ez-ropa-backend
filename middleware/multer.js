// 📁 backend/middleware/multer.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 📂 Ruta de subida de archivos
const UPLOAD_DIR = path.resolve('uploads');

// 📂 Crear carpeta 'uploads' si no existe
if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log("📁 Carpeta 'uploads' creada correctamente");
  } catch (err) {
    console.error('❌ Error creando carpeta uploads:', err.message);
  }
}

// 🔒 Reglas de validación
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// 💾 Configuración de almacenamiento (multer.diskStorage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/\s+/g, '-') // Reemplazar espacios por guiones
      .replace(/[^a-z0-9-]/g, '') // Limpiar caracteres no permitidos
      .substring(0, 50);

    const uniqueFilename = `${Date.now()}-${baseName}${ext}`;
    cb(null, uniqueFilename);
  }
});

// 🧪 Validación de archivos subidos
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(mime)) {
    cb(null, true);
  } else {
    console.warn(`⚠️ Archivo rechazado: ${file.originalname}`);
    cb(new Error('❌ Solo se permiten imágenes en formato JPG, PNG o WEBP'), false);
  }
};

// 🚀 Instancia de Multer exportada
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

export default upload;
