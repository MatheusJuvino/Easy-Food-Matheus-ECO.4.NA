const restaurantService = require("./restaurant.service");
const { optimizeImage } = require("../shared/image.service");

async function list(req, res) {
  try {
    const restaurants = await restaurantService.listRestaurants(req.query, req.user);
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "Erro interno do servidor"
    });
  }
}

async function getById(req, res) {
  try {
    const restaurant = await restaurantService.getRestaurant(req.params.id);
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "Erro interno do servidor"
    });
  }
}

async function create(req, res) {
  const userId = req.user && req.user.id;

  if (!userId) {
    return res.status(401).json({
      error: "Usuário não autenticado"
    });
  }

  try {
    const restaurant = await restaurantService.createRestaurant(req.body, userId);
    res.status(201).json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "Erro interno do servidor"
    });
  }
}

async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Envie uma imagem"
      });
    }

    const restaurantId = Number(req.params.id);

    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      return res.status(400).json({
        error: "ID do restaurante inválido"
      });
    }

    const photoUrl = await optimizeImage(req.file.buffer, "restaurants");
    const restaurant = await restaurantService.updateRestaurantPhoto(restaurantId, photoUrl);

    res.json({
      message: "Foto do restaurante atualizada com sucesso",
      restaurant
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Restaurante não encontrado"
      });
    }

    res.status(500).json({
      error: "Erro ao atualizar foto do restaurante"
    });
  }
}

module.exports = {
  list,
  getById,
  create,
  uploadPhoto
};
