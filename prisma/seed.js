const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const existentes = await prisma.restaurant.count();
  if (existentes > 0) {
    console.log("Banco já possui restaurantes. Seed ignorado.");
    return;
  }

  await prisma.restaurant.createMany({
    data: [
      {
        name: "Pizzaria Perto",
        category: "Pizza",
        rating: 4.5,
        endereco: "Rua B",
        cidade: "São Paulo",
        bairro: "Centro",
        latitude: -23.5505,
        longitude: -46.6333
      },
      {
        name: "Sushi Longe",
        category: "Japonesa",
        rating: 3.0,
        endereco: "Rua C",
        cidade: "Campinas",
        bairro: "Cambuí",
        latitude: -22.8893,
        longitude: -47.0456
      },
      {
        name: "Bar Sem GPS",
        category: "Bar",
        rating: 2.0,
        endereco: "Rua D",
        cidade: "Santos",
        bairro: "Gonzaga",
        latitude: -23.9675,
        longitude: -46.3334
      }
    ]
  });
}

main()
  .catch(function (e) {
    console.error(e);
    process.exit(1);
  })
  .finally(async function () {
    await prisma.$disconnect();
  });
