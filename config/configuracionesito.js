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
  "CLOUDINARY_API_SECRET"
];

// 🚨 Verificación
const missing = requiredVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Faltan variables obligatorias en el archivo .env:\n🔴 ${missing.join(', ')}`);
  process.exit(1);
}

// 🌍 Configuración general
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

  // 🌐 CORS: Dominios permitidos
  allowedOrigins: [
    //https://km-ez-ropa-frontend.onrender.com',
    'https://kmezropacatalogo.com',
    'http://localhost:3000'
  ]
};

if (config.env === 'development') {
  console.log("🔧 Modo de desarrollo activo");
}

module.exports = config;
