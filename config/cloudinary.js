const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ✅ Configuración segura desde .env
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// 🚀 Almacenamiento en Cloudinary con reglas de validación
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // 🔒 Validar tipo MIME
    const mimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!mimeTypes.includes(file.mimetype)) {
      const error = new Error('Tipo de imagen no permitido. Usa JPG, PNG o WEBP.');
      error.status = 400;
      throw error;
    }

    return {
      folder: 'km-ez-ropa',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, crop: 'limit' }],
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`.toLowerCase()
    };
  }
});

module.exports = { cloudinary, storage };
