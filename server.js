require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("Defina JWT_SECRET no arquivo .env");
  process.exit(1);
}

const app = require("./src/app");

app.listen(3000, function () {
  console.log("EasyFood rodando na porta 3000");
});
