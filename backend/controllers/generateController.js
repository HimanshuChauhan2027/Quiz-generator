const { generateQuizQuestions } = require("../services/geminiService");
const { saveGeneratedQuiz } = require("../services/quizService");

async function generateQuiz(req, res) {
  const { topic, difficulty, language, num_questions } = req.body;

  if (!topic || !difficulty || !language) {
    return res.status(400).json({ message: "topic, difficulty and language are required" });
  }

  let questions;
  try {
    questions = await generateQuizQuestions(topic, difficulty, language, num_questions || 5);
  } catch (err) {
    console.error("Gemini generation failed:", err);
    return res.status(500).json({ message: "Quiz generation failed. Please try again later." });
  }

  const quiz = await saveGeneratedQuiz({
    topic,
    difficulty,
    language,
    questions,
    ownerId: req.user.id,
  });

  res.json({
    id: quiz.id,
    title: quiz.title,
    language: quiz.language,
    difficulty: quiz.difficulty,
    questions,
  });
}

module.exports = { generateQuiz };
