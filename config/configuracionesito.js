// backend/config/configuracionesito.js
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// 🛡️ Verifica variables necesarias
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

const missing = requiredVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Faltan variables en .env: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  adminUser: process.env.ADMIN_USER,
  adminPass: process.env.ADMIN_PASS,

  // 🌩️ Cloudinary config
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  },

  allowedOrigins: [
    'https://km-ez-ropa-frontend.onrender.com',
    'http://localhost:3000'
  ]
};
