// 📁 backend/config/cloudinary.js
const { v2: cloudinary } = require("cloudinary");
const config = require("./configuracionesito");

// ✅ Validar que se tengan los datos necesarios
const { cloud_name, api_key, api_secret } = config.cloudinary;

if (!cloud_name || !api_key || !api_secret) {
  console.error("❌ Faltan las credenciales de Cloudinary en configuración");
  process.exit(1);
}

// ⚙️ Configurar Cloudinary
cloudinary.config({
  cloud_name,
  api_key,
  api_secret
});

// 🐞 Mostrar info en desarrollo
if (config.env !== 'production') {
  console.log("🔐 Cloudinary configurado correctamente:");
  console.log(`🌩️ cloud_name: ${cloud_name}`);
  console.log(`🔑 api_key: ${api_key ? "✓" : "❌"}`);
  console.log(`🔒 api_secret: ${api_secret ? "✓" : "❌"}`);
}

module.exports = { cloudinary };
