const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.get("/stats", requireAuth, asyncHandler(userController.getStats));

module.exports = router;
