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

function receberImagem(req, res, next) {
  const handler = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "file", maxCount: 1 }
  ]);

  handler(req, res, function (error) {
    if (error) {
      return next(error);
    }

    const arquivos = req.files || {};
    req.file =
      (arquivos.image && arquivos.image[0]) ||
      (arquivos.photo && arquivos.photo[0]) ||
      (arquivos.file && arquivos.file[0]);
    next();
  });
}

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
  receberImagem,
  handleUploadError
};
