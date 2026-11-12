const express = require("express");
const controller = require("./restaurant.controller");
const authenticate = require("../auth/auth.middleware");
const { authenticateOptional } = require("../auth/auth.middleware");
const { receberImagem } = require("../shared/upload.middleware");

const router = express.Router();

router.get("/", authenticateOptional, controller.list);
router.get("/:id", authenticateOptional, controller.getById);
router.post("/", authenticate, controller.create);
router.post("/:id/photo", authenticate, receberImagem, controller.uploadPhoto);

module.exports = router;
