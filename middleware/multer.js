const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📁 Asegura que la carpeta 'uploads' exista
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 💾 Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/\s+/g, "-")            // Espacios → guiones
      .replace(/[^\w\-]/g, "")         // Caracteres no seguros
      .substring(0, 50);               // Limitar longitud

    const uniqueName = `${Date.now()}-${base}${ext}`;
    cb(null, uniqueName);
  }
});

// ✅ Tipos permitidos
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

// 🔐 Filtro de archivos
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ALLOWED_EXT.includes(ext) && ALLOWED_MIME.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Archivo inválido. Solo se permiten imágenes (jpg, jpeg, png, webp)."));
  }
};

// 🛡️ Inicializar Multer con configuración segura
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter
});

module.exports = upload;
