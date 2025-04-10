const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

// ✅ Cargar variables de entorno del archivo .env
dotenv.config();

// ✅ Verificación de variables obligatorias
const requiredVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missing = requiredVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Faltan las siguientes variables de entorno para Cloudinary: ${missing.join(', ')}`);
  process.exit(1); // 🚫 Detiene la ejecución si faltan datos críticos
}

// ✅ Debug de configuración solo si no estás en producción
if (process.env.NODE_ENV !== 'production') {
  console.log("🔐 Cloudinary Configuración:", {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY ? "✓" : "❌",
    secret: process.env.CLOUDINARY_API_SECRET ? "✓" : "❌"
  });
}

// ✅ Configuración oficial de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = { cloudinary };
