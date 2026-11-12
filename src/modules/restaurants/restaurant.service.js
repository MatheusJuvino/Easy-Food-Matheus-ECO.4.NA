const prisma = require("../../database/prisma");
const { sendEmail } = require("../shared/email.service");
const {
  textoSeguro,
  lerNota,
  dadosLocal,
  restaurantePublico,
  distanciaKm
} = require("../shared/safe-text");

async function listRestaurants(query, usuarioAutenticado) {
  let restaurantes = await prisma.restaurant.findMany();
  restaurantes = restaurantes.map(restaurantePublico);

  const minRating = query.minRating === undefined || query.minRating === "" ? null : Number(query.minRating);
  const maxRating = query.maxRating === undefined || query.maxRating === "" ? null : Number(query.maxRating);

  if (minRating != null && !Number.isNaN(minRating)) {
    restaurantes = restaurantes.filter(function (item) {
      return Number(item.rating || 0) >= minRating;
    });
  }

  if (maxRating != null && !Number.isNaN(maxRating)) {
    restaurantes = restaurantes.filter(function (item) {
      return Number(item.rating || 0) <= maxRating;
    });
  }

  if (query.ordenar === "proximidade") {
    if (!usuarioAutenticado) {
      const error = new Error("Faça login para buscar os restaurantes mais próximos.");
      error.statusCode = 401;
      throw error;
    }

    const usuario = await prisma.user.findUnique({
      where: { id: Number(usuarioAutenticado.id) }
    });

    if (!usuario || usuario.latitude == null || usuario.longitude == null) {
      const error = new Error("Cadastre seu endereço em Meu endereço para buscar os mais próximos.");
      error.statusCode = 400;
      throw error;
    }

    restaurantes = restaurantes
      .map(function (item) {
        const copia = Object.assign({}, item);
        if (item.latitude != null && item.longitude != null) {
          copia.distanciaKm = Number(
            distanciaKm(usuario.latitude, usuario.longitude, item.latitude, item.longitude).toFixed(2)
          );
        } else {
          copia.distanciaKm = null;
        }
        return copia;
      })
      .sort(function (a, b) {
        if (a.distanciaKm == null) return 1;
        if (b.distanciaKm == null) return -1;
        return a.distanciaKm - b.distanciaKm;
      });
  }

  return restaurantes;
}

async function createRestaurant(body, userId) {
  const name = textoSeguro(body.name);
  const category = textoSeguro(body.category);
  const rating = lerNota(body.rating);
  const local = dadosLocal(body);

  if (!name || !category) {
    const error = new Error("Nome e categoria são obrigatórios");
    error.statusCode = 400;
    throw error;
  }

  if (rating === null) {
    const error = new Error("A avaliação deve ser um número de 0 a 5.");
    error.statusCode = 400;
    throw error;
  }

  if (!local.endereco || !local.cidade || !local.bairro) {
    const error = new Error("Informe endereço, cidade e bairro do restaurante.");
    error.statusCode = 400;
    throw error;
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      category,
      rating,
      userId: Number(userId),
      ...local
    }
  });

  try {
    await sendEmail({
      to: "teste@email.com",
      toName: "Administrador EasyFood",
      subject: "Novo restaurante cadastrado!",
      header: "Cadastro realizado!",
      body: "O restaurante " + restaurant.name + " foi cadastrado com sucesso.",
      footer: "Equipe EasyFood"
    });
  } catch (error) {
    console.error("Erro na simulação de e-mail:", error.message);
  }

  return restaurantePublico(restaurant);
}

async function getRestaurant(id) {
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    const error = new Error("ID do restaurante inválido");
    error.statusCode = 400;
    throw error;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: { dishes: true }
  });

  if (!restaurant) {
    const error = new Error("Restaurante não encontrado");
    error.statusCode = 404;
    throw error;
  }

  const publico = restaurantePublico(restaurant);
  publico.dishes = (restaurant.dishes || []).map(function (prato) {
    return {
      id: prato.id,
      name: prato.name,
      description: prato.description,
      price: Number(prato.price),
      imageUrl: prato.imageUrl,
      restaurantId: prato.restaurantId
    };
  });
  return publico;
}

async function updateRestaurantPhoto(id, photo) {
  return prisma.restaurant.update({
    where: { id: Number(id) },
    data: { photo }
  });
}

module.exports = {
  listRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurantPhoto
};
