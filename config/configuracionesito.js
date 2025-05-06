// 📁 backend/config/configuracionesito.js
// 🎯 Carga y validación de configuración global del proyecto

import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// 📍 __dirname para ESModules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ Cargar variables del entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// 🧩 Variables requeridas
const requiredVars = [
  'PORT', 'MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET',
  'ADMIN_USER', 'ADMIN_PASS', 'SESSION_SECRET',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
  'ALLOWED_ORIGINS', 'RATE_LIMIT_WINDOW', 'RATE_LIMIT_MAX',
  'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_API_BASE',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
  'EMAIL_FROM', 'EMAIL_PASSWORD'
]

// 🚨 Validar existencia
const missing = requiredVars.filter(k => !process.env[k])
if (missing.length > 0) {
  console.error(`❌ Faltan variables en .env: ${missing.join(', ')}`)
  process.exit(1)
}

// 🌐 Orígenes permitidos (cors)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(origin => /^https?:\/\/.+/.test(origin))

// 🛠️ Configuración final
const config = {
  env: (process.env.NODE_ENV || 'development').toLowerCase(),
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,

  sessionSecret: process.env.SESSION_SECRET,
  sessionTTL: Number.parseInt(process.env.SESSION_TTL, 10) || 14 * 24 * 60 * 60, // segundos

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
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },

  email: {
    from: process.env.EMAIL_FROM,
    password: process.env.EMAIL_PASSWORD
  },

  allowedOrigins,

  rateLimitWindow: Number.parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15,
  rateLimitMax: Number.parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  enableXSSProtection: true,
  enableMongoSanitize: true,
  enableHPP: true
}

// 🧪 Solo en modo desarrollo: mostrar configuración crítica
if (config.env !== 'production') {
  console.log('🧪 Modo DEV activo - Configuración resumida:')
  console.log('🌐 ALLOWED_ORIGINS:', config.allowedOrigins)
  console.log('🔒 Claves cargadas correctamente:', {
    JWT: !!config.jwtSecret,
    REFRESH: !!config.jwtRefreshSecret,
    SESSION: !!config.sessionSecret,
    CLOUDINARY: !!config.cloudinary.cloud_name,
    PAYPAL: !!config.paypal.clientId,
    GOOGLE: !!config.google.clientId,
    EMAIL: !!config.email.from
  })
}

export default config
