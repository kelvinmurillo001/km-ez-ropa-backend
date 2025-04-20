// 📁 backend/config/cloudinary.js 
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

// ✅ Cargar variables de entorno desde .env
dotenv.config();

// ✅ Validar que las variables de entorno necesarias estén presentes
const requiredVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missing = requiredVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Faltan las siguientes variables de entorno para Cloudinary: ${missing.join(', ')}`);
  process.exit(1); // ❌ Detiene el servidor si faltan datos críticos
}

// 🛠️ Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🐞 Mostrar info en desarrollo
if (process.env.NODE_ENV !== 'production') {
  console.log("🔐 Cloudinary configurado correctamente:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? "✓" : "❌",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "✓" : "❌"
  });
}

module.exports = { cloudinary };
