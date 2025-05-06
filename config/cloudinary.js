// 📁 backend/config/cloudinary.js
// 🎯 Configuración de Cloudinary para gestión de imágenes

import { v2 as cloudinary } from 'cloudinary'
import config from './configuracionesito.js'

// ✅ Extraer credenciales desde config
const credentials = config.cloudinary || {}
const cloudName = credentials.cloud_name
const apiKey = credentials.api_key
const apiSecret = credentials.api_secret

// 🔐 Validar credenciales necesarias
if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Error: Credenciales de Cloudinary incompletas. Revisa tu archivo .env o configuraciones.')
  process.exit(1)
}

// ⚙️ Configuración de Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
})

// 🐞 Información en entorno de desarrollo
if (config.env !== 'production') {
  console.log('✅ Cloudinary configurado (modo desarrollo)')
  console.log(`🌩️ Cloud Name: ${cloudName}`)
  console.log(`🔑 API Key: ${apiKey.substring(0, 4)}****`)
}

export { cloudinary }
