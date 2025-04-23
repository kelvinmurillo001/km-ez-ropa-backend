// 📁 backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary'
import config from './configuracionesito.js'

// ✅ Extraer credenciales y aplicar camelCase
const {
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
} = config.cloudinary || {}

// 🔐 Validación estricta
if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    '❌ Error: Faltan las credenciales de Cloudinary. Revisa tu archivo de configuración.'
  )
  process.exit(1)
}

// ⚙️ Configuración de Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
})

// 🐞 Solo en desarrollo: mostrar configuración mínima
if (config.env !== 'production') {
  console.log('✅ Cloudinary configurado correctamente en modo desarrollo.')
  console.log(`🌩️ cloud_name: ${cloudName}`)
  console.log('🔑 api_key: visible')
}

export { cloudinary }
