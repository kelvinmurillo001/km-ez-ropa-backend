const streamifier = require("streamifier");
const { cloudinary } = require("../config/cloudinary");

/**
 * 📤 Subir una imagen a Cloudinary
 */
const uploadImage = async (req, res) => {
  try {
    // Validar existencia del archivo
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "⚠️ No se ha enviado ninguna imagen." });
    }

    const mimeType = req.file.mimetype;
    if (!mimeType.startsWith("image/")) {
      return res.status(400).json({ message: "⚠️ Solo se permiten archivos de imagen." });
    }

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "promociones", // puedes hacer dinámico con req.body.folder
            resource_type: "image"
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadToCloudinary();

    return res.status(200).json({
      message: "✅ Imagen subida correctamente",
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (err) {
    console.error("❌ Error en uploadController:", err);
    return res.status(500).json({
      message: "❌ Error interno al subir imagen.",
      error: err.message
    });
  }
};

module.exports = {
  uploadImage
};
