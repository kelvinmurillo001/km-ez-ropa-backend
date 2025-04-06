const multer = require("multer"); 
const path = require("path");
const fs = require("fs");

// 📁 Asegura que la carpeta 'uploads' exista
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 💾 Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // ✅ guarda en /uploads
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/\s+/g, '-')        // Reemplaza espacios por guiones
      .replace(/[^\w\-]/g, '');    // Elimina caracteres no seguros

    const uniqueName = `${Date.now()}-${base}${ext}`;
    cb(null, uniqueName);
  }
});

// 🛡️ Filtro: solo imágenes válidas
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExt.includes(ext)) cb(null, true);
    else cb(new Error("❌ Solo se permiten imágenes (jpg, jpeg, png, webp)"));
  }
});

module.exports = upload;
