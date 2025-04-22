// backend/config/configuracionesito.js
const path = require('path');
const dotenv = require('dotenv');

// 📦 Cargar archivo .env desde la raíz del backend
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// 🧩 Variables obligatorias
const requiredVars = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'ADMIN_USER',
  'ADMIN_PASS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ALLOWED_ORIGINS'
];

// 🚨 Verificación de variables obligatorias
const missing = requiredVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Faltan variables en .env:\n🔴 ${missing.join(', ')}`);
  process.exit(1);
}

// 🌐 CORS dinámico desde .env (limpieza de espacios y slashes finales)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''));

// 🌍 Configuración general
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  adminUser: process.env.ADMIN_USER,
  adminPass: process.env.ADMIN_PASS,

  // ☁️ Cloudinary
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  },

  // 🌐 Lista blanca CORS limpia
  allowedOrigins
};

if (config.env === 'development') {
  console.log('🔧 Modo de desarrollo activo');
  console.log('🌍 Orígenes permitidos CORS:', allowedOrigins);
  console.log('🔐 Cloudinary configurado correctamente:');
  console.log('🌩️ cloud_name:', config.cloudinary.cloud_name);
  console.log('🔑 api_key: ✓');
  console.log('🔒 api_secret: ✓');
}

module.exports = config;
