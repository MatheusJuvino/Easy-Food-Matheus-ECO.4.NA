const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error("Formato de imagem não permitido");
      error.statusCode = 400;
      return callback(error);
    }

    callback(null, true);
  }
});

function handleUploadError(error, req, res, next) {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "A imagem não pode ultrapassar 5 MB"
      });
    }

    return res.status(400).json({
      error: "Erro no envio da imagem"
    });
  }

  if (error.statusCode === 400) {
    return res.status(400).json({
      error: error.message
    });
  }

  next(error);
}

module.exports = {
  upload,
  handleUploadError
};
