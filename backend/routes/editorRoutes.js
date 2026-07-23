const express = require("express");
const router = express.Router();

const editorController = require("../controllers/editorController");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.get("/my-quizzes", requireAuth, asyncHandler(editorController.getMyQuizzes));
router.get("/templates", asyncHandler(editorController.getTemplates));
router.post("/quiz/:id/duplicate", requireAuth, asyncHandler(editorController.duplicateQuiz));

module.exports = router;
