const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📁 Ruta de la carpeta de uploads
const uploadDir = path.join(__dirname, "..", "uploads");

// 📂 Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Carpeta 'uploads' creada correctamente");
  } catch (err) {
    console.error("❌ Error creando carpeta de uploads:", err.message);
  }
}

// 🔒 Configuración de seguridad
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

// 💾 Almacenamiento en disco
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .substring(0, 50);

    const uniqueName = `${Date.now()}-${base}${ext}`;
    cb(null, uniqueName);
  }
});

// 🧪 Validación de archivo
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  const isValid = ALLOWED_EXT.includes(ext) && ALLOWED_MIME.includes(mime);

  if (isValid) {
    cb(null, true);
  } else {
    console.warn(`⚠️ Archivo rechazado por tipo: ${file.originalname}`);
    cb(new Error("❌ Solo se permiten imágenes JPG, PNG, o WEBP"));
  }
};

// 📦 Inicializar Multer con todo configurado
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
});

module.exports = upload;
