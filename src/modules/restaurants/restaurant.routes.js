const express = require("express");
const controller = require("./restaurant.controller");
const authenticate = require("../auth/auth.middleware");
const { authenticateOptional } = require("../auth/auth.middleware");
const { upload } = require("../shared/upload.middleware");

const router = express.Router();

router.get("/", authenticateOptional, controller.list);
router.post("/", authenticate, controller.create);
router.post(
  "/:id/photo",
  authenticate,
  upload.single("photo"),
  controller.uploadPhoto
);

module.exports = router;
