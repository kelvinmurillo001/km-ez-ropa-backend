// 📁 backend/controllers/uploadController.js
import streamifier from 'streamifier'
import { cloudinary } from '../config/cloudinary.js'
import config from '../config/configuracionesito.js'
import logger from '../utils/logger.js'

/**
 * 📤 Subir imagen a Cloudinary
 * @route   POST /api/uploads/image
 * @access  Admin
 */
export const uploadImage = async (req, res) => {
  try {
    const file = req.file

    // 📛 Validar presencia del archivo
    if (!file?.buffer) {
      logger.warn('Intento de subida sin archivo')
      return res.status(400).json({
        ok: false,
        message: '⚠️ No se ha proporcionado ningún archivo de imagen.'
      })
    }

    // 📛 Validar tipo MIME
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      logger.warn(`Archivo con tipo inválido: ${file.mimetype}`)
      return res.status(400).json({
        ok: false,
        message: '⚠️ Solo se permiten archivos de imagen.'
      })
    }

    // 📂 Validar carpeta de destino
    const carpetaSolicitada = String(req.body.folder || config.defaultUploadFolder).trim().toLowerCase()
    const carpetasPermitidas = Array.isArray(config.allowedUploadFolders)
      ? config.allowedUploadFolders.map(f => f.toLowerCase())
      : []
    const folder = carpetasPermitidas.includes(carpetaSolicitada)
      ? carpetaSolicitada
      : config.defaultUploadFolder

    // 🚀 Subir a Cloudinary con streaming
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (err, result) => (err ? reject(err) : resolve(result))
      )
      streamifier.createReadStream(file.buffer).pipe(stream)
    })

    logger.info(`✅ Imagen subida correctamente a carpeta '${folder}'`, {
      url: uploadResult.secure_url,
      id: uploadResult.public_id
    })

    return res.status(200).json({
      ok: true,
      message: '✅ Imagen subida correctamente.',
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        folder
      }
    })
  } catch (err) {
    logger.error('❌ Error al subir imagen:', err)
    return res.status(500).json({
      ok: false,
      message: '❌ Error interno al subir imagen.',
      ...(config.env !== 'production' && { error: err.message })
    })
  }
}
