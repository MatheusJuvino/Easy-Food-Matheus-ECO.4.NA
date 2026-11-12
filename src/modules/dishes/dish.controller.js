const dishService = require("./dish.service");

async function create(req, res) {
  try {
    const dish = await dishService.createDish(req.params.restaurantId, req.body);
    return res.status(201).json(dish);
  } catch (error) {
    console.error("Erro ao cadastrar prato:", error.message);
    return res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "Erro interno ao cadastrar prato"
    });
  }
}

async function list(req, res) {
  try {
    const dishes = await dishService.listDishes(req.params.restaurantId);
    return res.status(200).json(dishes);
  } catch (error) {
    console.error("Erro ao listar pratos:", error.message);
    return res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "Erro ao consultar pratos"
    });
  }
}

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Nenhuma imagem enviada"
      });
    }

    const dish = await dishService.uploadDishImage(req.params.dishId, req.file.buffer);
    return res.status(200).json(dish);
  } catch (error) {
    console.error("Erro ao processar imagem:", error.message);
    return res.status(error.statusCode || 500).json({
      error: error.statusCode ? error.message : "Erro ao processar imagem"
    });
  }
}

module.exports = {
  create,
  list,
  uploadImage
};
