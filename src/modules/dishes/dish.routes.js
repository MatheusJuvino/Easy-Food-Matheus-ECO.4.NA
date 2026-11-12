const express = require("express");
const router = express.Router();

const dishController = require("./dish.controller");
const authMiddleware = require("../auth/auth.middleware");
const { receberImagem } = require("../shared/upload.middleware");

router.get("/restaurants/:restaurantId/dishes", dishController.list);
router.post("/restaurants/:restaurantId/dishes", authMiddleware, dishController.create);
router.post("/dishes/:dishId/image", authMiddleware, receberImagem, dishController.uploadImage);

module.exports = router;
