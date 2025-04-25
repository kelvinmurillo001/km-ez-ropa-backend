// 📁 backend/config/configuracionesito.js
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// 📍 Corrección para __dirname en ESModules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// 🧩 Lista de variables obligatorias
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
  'ALLOWED_ORIGINS'
]

// 🚨 Validar que todas las variables estén presentes
const missing = requiredVars.filter(key => !process.env[key])
if (missing.length > 0) {
  console.error(`❌ Faltan variables .env: ${missing.join(', ')}`)
  process.exit(1)
}

// 🌐 Limpiar y normalizar dominios CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(origin => /^https?:\/\/.+/.test(origin))

// 🛡️ Exportar configuración global
const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  adminUser: process.env.ADMIN_USER,
  adminPass: process.env.ADMIN_PASS,

  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  },

  allowedOrigins,

  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 5,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,

  enableXSSProtection: true,
  enableMongoSanitize: true,
  enableHPP: true
}

// 🧪 Mostrar resumen en desarrollo
if (config.env !== 'production') {
  console.log('🧪 Modo DEV activo')
  console.log('✅ Variables cargadas correctamente')
  console.log('🌐 ALLOWED_ORIGINS:', config.allowedOrigins)
  console.log('🔑 JWT:', !!config.jwtSecret, 'Refresh:', !!config.jwtRefreshSecret)
  console.log('☁️ Cloudinary:', config.cloudinary.cloud_name)
}

export default config
