const sharp = require("sharp");
const path = require("path");
const fs = require("fs/promises");
const crypto = require("crypto");

async function optimizeImage(buffer, folder = "dishes") {
  try {
    const filename = crypto.randomUUID() + ".webp";
    const directory = path.resolve(process.cwd(), "uploads", folder);

    await fs.mkdir(directory, { recursive: true });

    const filePath = path.join(directory, filename);

    await sharp(buffer)
      .rotate()
      .resize({
        width: 800,
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toFile(filePath);

    return "/uploads/" + folder + "/" + filename;
  } catch (error) {
    const falha = new Error("Falha ao processar a imagem.");
    falha.statusCode = 500;
    throw falha;
  }
}

module.exports = {
  optimizeImage
};
