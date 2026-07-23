const express = require("express");
const router = express.Router();

const generateController = require("../controllers/generateController");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.post("/quiz", requireAuth, asyncHandler(generateController.generateQuiz));

module.exports = router;
