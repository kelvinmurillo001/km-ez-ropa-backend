// backend/config/configuracionesito.js
const path = require('path');
const dotenv = require('dotenv');

// 📦 Cargar archivo .env desde la raíz del backend
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// 🧩 Variables obligatorias
const requiredVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "ADMIN_USER",
  "ADMIN_PASS",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "ALLOWED_ORIGINS"
];

// 🚨 Verificación de variables faltantes
const missing = requiredVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Faltan variables obligatorias en el archivo .env:\n🔴 ${missing.join(', ')}`);
  process.exit(1);
}

// 🌐 CORS dinámico desde .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

if (allowedOrigins.length === 0) {
  console.warn("⚠️ No se encontraron ALLOWED_ORIGINS definidos en el archivo .env");
}

// ✅ Mostrar configuración segura en desarrollo
if (process.env.NODE_ENV !== "production") {
  console.log("🔧 Modo de desarrollo activo");
  console.log("🔐 Cloudinary configurado correctamente:");
  console.log(`🌩️ cloud_name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log("🔑 api_key: ✓");
  console.log("🔒 api_secret: ✓");
}

// 🌍 Configuración general exportada
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  adminUser: process.env.ADMIN_USER,
  adminPass: process.env.ADMIN_PASS,

  // 🌩️ Cloudinary
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  },

  // 🌐 Lista blanca de dominios permitidos para CORS
  allowedOrigins
};

module.exports = config;
