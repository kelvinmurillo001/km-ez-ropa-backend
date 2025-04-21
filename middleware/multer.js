const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📁 Asegurar carpeta de destino
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Carpeta 'uploads' creada automáticamente");
  } catch (err) {
    console.error("❌ Error al crear carpeta uploads:", err.message);
  }
}

// 📐 Configuración de límites y formatos permitidos
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];

// 💾 Configuración de almacenamiento
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

// 🔐 Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (ALLOWED_EXT.includes(ext) && ALLOWED_MIME.includes(mime)) {
    cb(null, true);
  } else {
    console.warn(`⚠️ Archivo rechazado: ${file.originalname}`);
    cb(new Error("❌ Archivo inválido. Solo JPG, JPEG, PNG o WEBP permitidos."));
  }
};

// 🛡️ Inicializar Multer con seguridad y límites
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
});

module.exports = upload;
