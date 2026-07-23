const express = require("express");
const router = express.Router();

const scoreController = require("../controllers/scoreController");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.use(requireAuth);

router.get("/user/history", asyncHandler(scoreController.getUserHistory));
router.get("/latest/:quizId", asyncHandler(scoreController.getLatestAttempt));
router.get("/attempt/:scoreId", asyncHandler(scoreController.getAttempt));

router.post("/:quizId", asyncHandler(scoreController.submitScore));
router.put("/:scoreId", asyncHandler(scoreController.updateScore));
router.delete("/:scoreId", asyncHandler(scoreController.deleteScore));

module.exports = router;
