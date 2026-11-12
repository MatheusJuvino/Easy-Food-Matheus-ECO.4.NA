const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");
const { textoSeguro } = require("../shared/safe-text");

function pratoPublico(prato) {
  return {
    id: prato.id,
    name: prato.name,
    description: prato.description,
    price: Number(prato.price),
    imageUrl: prato.imageUrl,
    restaurantId: prato.restaurantId
  };
}

async function createDish(restaurantId, data) {
  const id = Number(restaurantId);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("ID do restaurante inválido");
    error.statusCode = 400;
    throw error;
  }

  const name = textoSeguro(data.name);
  const description = textoSeguro(data.description);

  if (!name || !description || data.price === undefined || data.price === "") {
    const error = new Error("Preencha nome, descrição e preço do prato");
    error.statusCode = 400;
    throw error;
  }

  const price = Number(data.price);

  if (!Number.isFinite(price) || price <= 0) {
    const error = new Error("O preço deve ser maior que zero");
    error.statusCode = 400;
    throw error;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id }
  });

  if (!restaurant) {
    const error = new Error("Restaurante não encontrado");
    error.statusCode = 404;
    throw error;
  }

  const prato = await prisma.dish.create({
    data: {
      name,
      description,
      price,
      restaurant: {
        connect: { id }
      }
    }
  });

  return pratoPublico(prato);
}

async function listDishes(restaurantId) {
  const id = Number(restaurantId);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("ID do restaurante inválido");
    error.statusCode = 400;
    throw error;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id }
  });

  if (!restaurant) {
    const error = new Error("Restaurante não encontrado");
    error.statusCode = 404;
    throw error;
  }

  const pratos = await prisma.dish.findMany({
    where: { restaurantId: id }
  });

  return pratos.map(pratoPublico);
}

async function uploadDishImage(dishId, buffer) {
  const id = Number(dishId);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("ID do prato inválido");
    error.statusCode = 400;
    throw error;
  }

  const dish = await prisma.dish.findUnique({
    where: { id }
  });

  if (!dish) {
    const error = new Error("Prato não encontrado");
    error.statusCode = 404;
    throw error;
  }

  const imageUrl = await imageService.optimizeImage(buffer, "dishes");

  const atualizado = await prisma.dish.update({
    where: { id },
    data: { imageUrl }
  });

  return pratoPublico(atualizado);
}

module.exports = {
  createDish,
  listDishes,
  uploadDishImage
};
