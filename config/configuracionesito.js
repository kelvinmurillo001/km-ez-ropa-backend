// 📁 backend/config/configuracionesito.js
// 🎯 Cargar y validar la configuración global del proyecto

import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// 📍 Corrección para obtener __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// 🧩 Lista de variables de entorno obligatorias
const requiredVars = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ADMIN_USER',
  'ADMIN_PASS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ALLOWED_ORIGINS',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_API_BASE'
];

// 🚨 Validar existencia de todas las variables
const missing = requiredVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Error: Faltan variables en .env: ${missing.join(', ')}`);
  process.exit(1);
}

// 🌐 Limpiar y normalizar dominios para CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(origin => /^https?:\/\/.+/.test(origin));

// 🛡️ Construir objeto de configuración global
const config = {
  // 🔧 Entorno
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,

  // 🗄️ Base de Datos MongoDB
  mongoUri: process.env.MONGO_URI,

  // 🔒 Tokens JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,

  // 🧑‍💼 Credenciales Admin
  adminUser: process.env.ADMIN_USER,
  adminPass: process.env.ADMIN_PASS,

  // ☁️ Configuración de Cloudinary
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  },

  // 💳 Configuración de PayPal
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    apiBase: process.env.PAYPAL_API_BASE
  },

  // 🌐 Dominios permitidos para CORS
  allowedOrigins,

  // 🛡️ Seguridad Adicional
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 5, // minutos
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,     // máximo solicitudes por ventana
  enableXSSProtection: true,
  enableMongoSanitize: true,
  enableHPP: true
};

// 🧪 Mostrar resumen de configuración en modo desarrollo
if (config.env !== 'production') {
  console.log('🧪 Modo DEV activo');
  console.log('✅ Variables cargadas correctamente:');
  console.log('🌐 ALLOWED_ORIGINS:', config.allowedOrigins);
  console.log('🔑 JWT Secret:', config.jwtSecret ? 'Presente' : 'Falta');
  console.log('🔄 JWT Refresh Secret:', config.jwtRefreshSecret ? 'Presente' : 'Falta');
  console.log('☁️ Cloudinary:', config.cloudinary.cloud_name ? 'Configurado' : 'Falta');
  console.log('💳 PayPal ClientID:', config.paypal.clientId ? 'Cargado' : 'No cargado');
}

export default config;
