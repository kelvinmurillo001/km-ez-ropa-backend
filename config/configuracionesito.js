// backend/config/configuracionesito.js
require("dotenv").config();

// ✅ Validación mínima
const requiredVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "ADMIN_USER",
  "ADMIN_PASS"
];

const missing = requiredVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Faltan las siguientes variables de entorno: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  adminUser: process.env.ADMIN_USER,
  adminPass: process.env.ADMIN_PASS,
  allowedOrigins: [
    'https://km-ez-ropa-frontend.onrender.com',
    'http://localhost:3000'
  ]
};
