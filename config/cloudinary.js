// 📁 backend/config/cloudinary.js
// 🎯 Configuración de Cloudinary para gestión de imágenes

import { v2 as cloudinary } from 'cloudinary'
import config from './configuracionesito.js'

// ✅ Extraer credenciales y aplicar camelCase
const {
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
} = config.cloudinary || {}

// 🔐 Validar existencia de credenciales
if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Error: Faltan credenciales de Cloudinary. Verifica el archivo .env o la configuración.')
  process.exit(1)
}

// ⚙️ Configurar Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
})

// 🐞 Mostrar configuración mínima en desarrollo
if (config.env !== 'production') {
  console.log('✅ Cloudinary configurado correctamente en modo desarrollo.')
  console.log(`🌩️ Cloud Name: ${cloudName}`)
  console.log('🔑 API Key: visible')
}

// ✅ Exportar instancia configurada
export { cloudinary }
