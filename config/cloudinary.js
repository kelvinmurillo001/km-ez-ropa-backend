// 📁 backend/config/cloudinary.js
const { v2: cloudinary } = require("cloudinary");
const config = require("./configuracionesito");

// ✅ Extraemos credenciales de Cloudinary
const { cloud_name, api_key, api_secret } = config.cloudinary || {};

// 🔐 Validación estricta
if (!cloud_name || !api_key || !api_secret) {
  console.error("❌ Error: Faltan las credenciales de Cloudinary. Revisa tu archivo de configuración.");
  process.exit(1); // Cortar la ejecución si no hay credenciales
}

// ⚙️ Configuración de Cloudinary
cloudinary.config({
  cloud_name,
  api_key,
  api_secret
});

// 🐞 Solo en desarrollo: mostrar configuración mínima
if (config.env !== 'production') {
  console.log("✅ Cloudinary configurado correctamente en modo desarrollo.");
  console.log(`🌩️ cloud_name: ${cloud_name}`);
  console.log(`🔑 api_key: visible`);
  // api_secret JAMÁS se debe mostrar, incluso en desarrollo
}

module.exports = { cloudinary };
