const prisma = require("../../database/prisma");
const imageService = require("../shared/image.service");

async function createDish(restaurantId, data) {
  const id = Number(restaurantId);

  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("ID do restaurante inválido");
    error.statusCode = 400;
    throw error;
  }

  if (!data.name || !data.description || data.price === undefined) {
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

  return prisma.dish.create({
    data: {
      name: data.name,
      description: data.description,
      price,
      restaurantId: id
    }
  });
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

  return prisma.dish.findMany({
    where: { restaurantId: id }
  });
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

  return prisma.dish.update({
    where: { id },
    data: { imageUrl }
  });
}

module.exports = {
  createDish,
  listDishes,
  uploadDishImage
};
