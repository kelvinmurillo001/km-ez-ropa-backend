// 📁 backend/config/configuracionesito.js
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// 📍 Corrección para __dirname en ESModules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ Cargar variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

// 🧩 Lista de variables obligatorias
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
]

// 🚨 Validar que todas las variables estén presentes
const missing = requiredVars.filter(key => !process.env[key])
if (missing.length > 0) {
  console.error(
    `❌ Error: Faltan variables obligatorias en el archivo .env:\n🔴 ${missing.join(', ')}`
  )
  process.exit(1)
}

// 🌐 CORS - Limpiar y normalizar orígenes permitidos
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(origin => /^https?:\/\/.+/.test(origin)) // Validar formato

// 🛡️ Configuración central exportada
const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
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

  // 🌐 Lista blanca para CORS
  allowedOrigins,

  // 🚀 Opcional: otros flags de entorno
  enableCors: process.env.CORS_ENABLED === 'true',

  // 🔐 Protección contra DDoS
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,

  // 🧼 Seguridad extra para sanitizar peticiones
  enableXSSProtection: true,
  enableMongoSanitize: true,
  enableHPP: true
}

// 🧪 Mostrar información solo en desarrollo
if (config.env === 'development') {
  console.log('🧪 Modo de desarrollo activo')
  console.log('🌐 CORS Allowed Origins:', config.allowedOrigins)
  console.log('☁️ Cloudinary config ✅')
  console.log('🔑 JWT_SECRET presente:', !!config.jwtSecret)
  console.log('🛡️ DDoS: Ventana', config.rateLimitWindow, 'minutos - Máx', config.rateLimitMax)
}

export default config
