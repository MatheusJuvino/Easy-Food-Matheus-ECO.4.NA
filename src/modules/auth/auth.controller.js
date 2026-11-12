const authService = require("./auth.service");
const { optimizeImage } = require("../shared/image.service");

function statusDoErro(error, padrao) {
  return error.statusCode || padrao;
}

async function register(req, res) {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return res.status(statusDoErro(error, 400)).json({
      error: error.message
    });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(statusDoErro(error, 401)).json({
      error: error.message
    });
  }
}

async function me(req, res) {
  try {
    const user = await authService.getMe(req.user.id);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(statusDoErro(error, 500)).json({
      error: error.message
    });
  }
}

async function updateMe(req, res) {
  try {
    const user = await authService.updateMe(req.user.id, req.body);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(statusDoErro(error, 500)).json({
      error: error.message
    });
  }
}

async function uploadProfilePhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Envie uma imagem"
      });
    }

    const photoUrl = await optimizeImage(req.file.buffer, "profiles");
    const user = await authService.updateProfilePhoto(req.user.id, photoUrl);

    return res.status(200).json({
      message: "Foto de perfil atualizada com sucesso",
      user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro ao atualizar foto de perfil"
    });
  }
}

module.exports = {
  register,
  login,
  me,
  updateMe,
  uploadProfilePhoto
};
