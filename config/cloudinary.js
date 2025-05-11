// 📁 backend/config/cloudinary.js
// 🎯 Configuración de Cloudinary para gestión de imágenes

import { v2 as cloudinary } from 'cloudinary';
import config from './configuracionesito.js';

// ✅ Extraer credenciales desde configuración central
const { cloud_name, api_key, api_secret } = config.cloudinary || {};

// 🔐 Validar credenciales necesarias
if (!cloud_name || !api_key || !api_secret) {
  console.error('❌ Error: Credenciales de Cloudinary incompletas.');
  console.error('📌 Asegúrate de tener CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en tu archivo .env.');
  process.exit(1); // ⚠️ Detener el servidor si no hay conexión segura con Cloudinary
}

// ⚙️ Aplicar configuración
cloudinary.config({
  cloud_name,
  api_key,
  api_secret
});

// 🧪 Solo en desarrollo: Mostrar configuración parcial
if (config.env !== 'production') {
  console.log('✅ Cloudinary configurado en entorno de desarrollo');
  console.log(`🌩️ Cloud Name: ${cloud_name}`);
  console.log(`🔑 API Key (oculta): ${api_key.substring(0, 4)}****`);
}

export { cloudinary };
