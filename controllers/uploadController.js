const streamifier = require("streamifier");
const { cloudinary } = require("../config/cloudinary");

/**
 * 📤 Subir una imagen a Cloudinary
 */
const uploadImage = async (req, res) => {
  try {
    // Validar archivo
    if (!req.file?.buffer) {
      return res.status(400).json({
        ok: false,
        message: "⚠️ No se ha enviado ninguna imagen."
      });
    }

    const mimeType = req.file.mimetype;
    if (!mimeType.startsWith("image/")) {
      return res.status(400).json({
        ok: false,
        message: "⚠️ Solo se permiten archivos de imagen."
      });
    }

    // 📁 Carpeta destino
    const folder = (req.body.folder || "promociones").trim().toLowerCase();

    const allowedFolders = ["promociones", "productos_kmezropa", "banners", "temp"];
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({
        ok: false,
        message: "⚠️ Carpeta no permitida para subir imágenes."
      });
    }

    // 📤 Función de subida a Cloudinary
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image"
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadToCloudinary();

    return res.status(200).json({
      ok: true,
      message: "✅ Imagen subida correctamente",
      data: {
        url: result.secure_url,
        public_id: result.public_id
      }
    });

  } catch (err) {
    console.error("❌ Error al subir imagen:", err);
    return res.status(500).json({
      ok: false,
      message: "❌ Error interno al subir imagen",
      error: err.message
    });
  }
};

module.exports = {
  uploadImage
};
