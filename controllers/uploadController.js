const streamifier = require("streamifier");
const { cloudinary } = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "⚠️ No se ha enviado ninguna imagen." });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "promociones",
        resource_type: "image"
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary error:", error);
          return res.status(500).json({ message: "❌ Error al subir imagen." });
        }

        return res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);

  } catch (err) {
    console.error("❌ Error en uploadController:", err);
    res.status(500).json({ message: "❌ Error interno al subir imagen." });
  }
};

module.exports = {
  uploadImage
};
