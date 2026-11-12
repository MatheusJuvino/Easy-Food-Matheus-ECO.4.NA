const express = require("express");
const cors = require("cors");
const path = require("path");

const restaurantRoutes = require("./modules/restaurants/restaurant.routes");
const authRoutes = require("./modules/auth/auth.routes");
const dishRoutes = require("./modules/dishes/dish.routes");
const authController = require("./modules/auth/auth.controller");
const authenticate = require("./modules/auth/auth.middleware");
const { handleUploadError, receberImagem } = require("./modules/shared/upload.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/restaurants", restaurantRoutes);
app.use("/auth", authRoutes);
app.use(dishRoutes);

app.post("/register", authController.register);
app.post("/login", authController.login);
app.get("/me", authenticate, authController.me);
app.put("/me", authenticate, authController.updateMe);
app.post("/me/photo", authenticate, receberImagem, authController.uploadProfilePhoto);
app.post("/me/image", authenticate, receberImagem, authController.uploadProfilePhoto);

app.use(handleUploadError);

app.use(function (error, req, res, next) {
  console.error(error);
  res.status(error.statusCode || 500).json({
    error: error.statusCode ? error.message : "Erro interno do servidor"
  });
});

module.exports = app;
