// 📁 backend/config/configuracionesito.js
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Cargar variables desde .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// 🔒 Variables requeridas
const requiredVars = [
  'PORT', 'MONGO_URI',
  'JWT_SECRET', 'JWT_REFRESH_SECRET',
  'ADMIN_USER', 'ADMIN_PASS',
  'SESSION_SECRET',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
  'ALLOWED_ORIGINS',
  'RATE_LIMIT_WINDOW', 'RATE_LIMIT_MAX',
  'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_API_BASE',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL',
  'EMAIL_FROM', 'EMAIL_PASSWORD'
];

// 🚨 Verificación de variables obligatorias
const missing = requiredVars.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Faltan variables en .env: ${missing.join(', ')}`);
  process.exit(1);
}

// ✅ Validar URL
const isValidURL = (url = '') => {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
};

// 🌐 Orígenes permitidos CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .map(o => (o.startsWith('http') ? o : `https://${o}`))
  .filter(isValidURL);

// 🧠 Configuración global
const config = {
  env: (process.env.NODE_ENV || 'development').toLowerCase(),
  port: Number(process.env.PORT) || 5000,

  mongoUri: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET,
  sessionTTL: Number(process.env.SESSION_TTL) || 1209600, // 14 días

  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,

  adminUser: process.env.ADMIN_USER,
  adminPass: process.env.ADMIN_PASS,

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  },

  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    apiBase: process.env.PAYPAL_API_BASE
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },

  email: {
    from: process.env.EMAIL_FROM,
    password: process.env.EMAIL_PASSWORD
  },

  allowedOrigins,
  rateLimitWindow: Number(process.env.RATE_LIMIT_WINDOW) || 15,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 100,

  enableXSSProtection: true,
  enableMongoSanitize: true,
  enableHPP: true
};

// 🧪 Logs si NO es producción
if (config.env !== 'production') {
  console.log('🧪 Modo desarrollo');
  console.log('🌐 ALLOWED_ORIGINS:', allowedOrigins);
  console.log('🔐 Configuración sensible cargada correctamente.');
}

export default config;
