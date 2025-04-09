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
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/\s+/g, "-")         // Espacios → guiones
      .replace(/[^\w\-]/g, "")      // Elimina caracteres peligrosos
      .substring(0, 50);            // 🔐 Máximo 50 caracteres

    const uniqueName = `${Date.now()}-${base}${ext}`;
    cb(null, uniqueName);
  }
});

// 🔐 Validación MIME + extensión
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ALLOWED_EXT.includes(ext) && ALLOWED_MIME.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Archivo inválido. Solo se permiten imágenes (jpg, jpeg, png, webp)."));
  }
};

// 🛡️ Configurar Multer con filtros y tamaño límite
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter
});

module.exports = upload;

