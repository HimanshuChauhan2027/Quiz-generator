const express = require("express");
const router = express.Router();

const quizController = require("../controllers/quizController");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

// Static routes must come before the "/:id" routes below
router.get("/stats/global", asyncHandler(quizController.getGlobalStats));
router.get("/leaderboard/:difficulty", asyncHandler(quizController.getLeaderboard));
router.get("/browse/public", asyncHandler(quizController.browsePublicQuizzes));

router.get("/", asyncHandler(quizController.getAllQuizzes));
router.post("/", requireAuth, asyncHandler(quizController.createQuiz));

router.get("/:id", asyncHandler(quizController.getQuiz));
router.put("/:id", requireAuth, asyncHandler(quizController.updateQuiz));
router.delete("/:id", requireAuth, asyncHandler(quizController.deleteQuiz));
router.get("/:id/scores/count", asyncHandler(quizController.getQuizAttemptCount));

module.exports = router;
