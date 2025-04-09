const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dmbnkrhek',
  api_key:    '831978565358562',
  api_secret: 'TIGp2ZEOr-oqPWG6K9V9Wg-gcWSU'
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'km-ez-ropa', // 📂 Carpeta donde se suben las imágenes
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, crop: 'limit' }]
  }
});

module.exports = { cloudinary, storage };
